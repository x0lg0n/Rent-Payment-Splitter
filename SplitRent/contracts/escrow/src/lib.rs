#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Vec, Symbol, symbol_short,
    IntoVal, Events
};

// Contract symbols
pub const ESCROW_ID: Symbol = symbol_short!("ESCROW");
pub const PARTICIPANT: Symbol = symbol_short!("PARTICIPANT");

/// Escrow status enumeration
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowStatus {
    Active,
    FullyFunded,
    Released,
    Refunding,
    Refunded,
    Disputed,
}

/// Participant structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Participant {
    pub address: Address,
    pub share_amount: i128,
    pub deposited: bool,
}

/// Escrow contract data structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowData {
    pub id: u64,
    pub creator: Address,
    pub landlord: Address,
    pub participants: Vec<Participant>,
    pub total_rent: i128,
    pub deposited_amount: i128,
    pub deadline: u64,
    pub status: EscrowStatus,
    pub created_at: u64,
}

/// Event types
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowEvent {
    EscrowCreated { escrow_id: u64, creator: Address, total_rent: i128 },
    DepositMade { escrow_id: u64, participant: Address, amount: i128 },
    EscrowReleased { escrow_id: u64, landlord: Address, amount: i128 },
    RefundProcessed { escrow_id: u64, participant: Address, amount: i128 },
}

#[contract]
pub struct RentEscrowContract;

#[contractimpl]
impl RentEscrowContract {
    /// Initialize a new escrow for rent splitting
    /// 
    /// # Arguments
    /// 
    /// * `env` - The Soroban environment
    /// * `creator` - The address creating the escrow
    /// * `landlord` - The landlord's address who will receive rent
    /// * `participants` - List of participant addresses
    /// * `shares` - List of share amounts for each participant
    /// * `deadline` - Unix timestamp for the escrow deadline
    /// 
    /// # Returns
    /// 
    /// Returns the escrow ID
    pub fn initialize(
        env: Env,
        creator: Address,
        landlord: Address,
        participants: Vec<Address>,
        shares: Vec<i128>,
        deadline: u64,
    ) -> u64 {
        // Validate inputs
        assert!(participants.len() > 0, "Must have at least one participant");
        assert!(participants.len() == shares.len(), "Participants and shares length mismatch");
        assert!(deadline > env.ledger().timestamp(), "Deadline must be in the future");
        
        // Generate escrow ID
        let escrow_id: u64 = env.ledger().sequence() as u64;
        
        // Calculate total rent and create participants
        let mut total_rent: i128 = 0;
        let mut participant_list: Vec<Participant> = Vec::new(&env);
        
        for i in 0..participants.len() {
            let share = shares.get(i).unwrap();
            total_rent += share;
            
            participant_list.push_back(Participant {
                address: participants.get(i).unwrap(),
                share_amount: share,
                deposited: false,
            });
        }
        
        assert!(total_rent > 0, "Total rent must be greater than 0");
        
        // Create escrow data
        let escrow = EscrowData {
            id: escrow_id,
            creator: creator.clone(),
            landlord: landlord.clone(),
            participants: participant_list,
            total_rent,
            deposited_amount: 0,
            deadline,
            status: EscrowStatus::Active,
            created_at: env.ledger().timestamp(),
        };
        
        // Store escrow
        env.storage().persistent().set(&ESCROW_ID, &escrow);
        
        // Emit event
        env.events().publish(
            (ESCROW_ID, Symbol::new(&env, "created")),
            EscrowEvent::EscrowCreated {
                escrow_id,
                creator,
                total_rent,
            },
        );
        
        escrow_id
    }
    
    /// Deposit funds into escrow
    /// 
    /// # Arguments
    /// 
    /// * `env` - The Soroban environment
    /// * `escrow_id` - The escrow ID
    /// * `participant` - The participant depositing funds
    pub fn deposit(env: Env, escrow_id: u64, participant: Address) -> bool {
        participant.require_auth();
        
        let mut escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&ESCROW_ID)
            .expect("Escrow not found");
        
        assert!(escrow.status == EscrowStatus::Active, "Escrow is not active");
        assert!(env.ledger().timestamp() <= escrow.deadline, "Escrow deadline passed");
        
        // Find participant and check if already deposited
        let mut found = false;
        for i in 0..escrow.participants.len() {
            let mut p = escrow.participants.get(i).unwrap();
            if p.address == participant {
                assert!(!p.deposited, "Participant already deposited");
                
                // In a real implementation, this would transfer tokens
                // For now, we just mark as deposited
                p.deposited = true;
                escrow.participants.set(i, p.clone());
                escrow.deposited_amount += p.share_amount;
                
                found = true;
                
                // Emit event
                env.events().publish(
                    (ESCROW_ID, Symbol::new(&env, "deposit")),
                    EscrowEvent::DepositMade {
                        escrow_id,
                        participant: participant.clone(),
                        amount: p.share_amount,
                    },
                );
                
                break;
            }
        }
        
        assert!(found, "Participant not found in escrow");
        
        // Check if fully funded
        if escrow.deposited_amount >= escrow.total_rent {
            escrow.status = EscrowStatus::FullyFunded;
        }
        
        // Update escrow
        env.storage().persistent().set(&ESCROW_ID, &escrow);
        
        true
    }
    
    /// Release funds to landlord when fully funded
    pub fn release(env: Env, escrow_id: u64) -> bool {
        let escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&ESCROW_ID)
            .expect("Escrow not found");
        
        assert!(
            escrow.status == EscrowStatus::FullyFunded || 
            (escrow.status == EscrowStatus::Active && escrow.deposited_amount >= escrow.total_rent),
            "Escrow not fully funded"
        );
        
        // In a real implementation, this would transfer to landlord
        // For now, we just update status
        
        // Emit event
        env.events().publish(
            (ESCROW_ID, Symbol::new(&env, "release")),
            EscrowEvent::EscrowReleased {
                escrow_id,
                landlord: escrow.landlord.clone(),
                amount: escrow.deposited_amount,
            },
        );
        
        true
    }
    
    /// Get escrow status
    pub fn get_status(env: Env, escrow_id: u64) -> EscrowData {
        env.storage()
            .persistent()
            .get(&ESCROW_ID)
            .expect("Escrow not found")
    }
    
    /// Get participant deposit status
    pub fn get_participant_status(
        env: Env,
        escrow_id: u64,
        participant: Address,
    ) -> (bool, i128) {
        let escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&ESCROW_ID)
            .expect("Escrow not found");
        
        for i in 0..escrow.participants.len() {
            let p = escrow.participants.get(i).unwrap();
            if p.address == participant {
                return (p.deposited, p.share_amount);
            }
        }
        
        panic!("Participant not found");
    }
    
    /// Check if escrow can be refunded (deadline passed and not fully funded)
    pub fn can_refund(env: Env, escrow_id: u64) -> bool {
        let escrow: EscrowData = env
            .storage()
            .persistent()
            .get(&ESCROW_ID)
            .expect("Escrow not found");
        
        escrow.status == EscrowStatus::Active && 
        env.ledger().timestamp() > escrow.deadline &&
        escrow.deposited_amount < escrow.total_rent
    }
}

#[cfg(test)]
mod test;
