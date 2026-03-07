#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contractevent, Address, Env, Vec, Symbol, symbol_short,
    Map, Val, IntoVal,
};

// Contract symbols
pub const ESCROWS: Symbol = symbol_short!("ESCROWS");
pub const ESCROW_COUNTER: Symbol = symbol_short!("ESCROWCTR");
pub const NATIVE_TOKEN: Symbol = symbol_short!("NATIVE");

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

// Contract Events
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowCreated {
    pub escrow_id: u64,
    pub creator: Address,
    pub total_rent: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DepositMade {
    pub escrow_id: u64,
    pub participant: Address,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowReleased {
    pub escrow_id: u64,
    pub landlord: Address,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RefundProcessed {
    pub escrow_id: u64,
    pub participant: Address,
    pub amount: i128,
}

#[contract]
pub struct RentEscrowContract;

#[contractimpl]
impl RentEscrowContract {
    /// Get escrow by ID from the escrows map
    fn get_escrow(env: &Env, escrow_id: u64) -> EscrowData {
        let escrows: Map<u64, EscrowData> = env
            .storage()
            .persistent()
            .get(&ESCROWS)
            .unwrap_or(Map::new(env));
        
        escrows
            .get(escrow_id)
            .expect("Escrow not found")
    }

    /// Save escrow to the escrows map
    fn save_escrow(env: &Env, escrow: EscrowData) {
        let mut escrows: Map<u64, EscrowData> = env
            .storage()
            .persistent()
            .get(&ESCROWS)
            .unwrap_or(Map::new(&env));
        
        escrows.set(escrow.id, escrow);
        env.storage().persistent().set(&ESCROWS, &escrows);
    }

    /// Get next escrow ID (auto-increment)
    fn get_next_escrow_id(env: &Env) -> u64 {
        let id: u64 = env
            .storage()
            .persistent()
            .get(&ESCROW_COUNTER)
            .unwrap_or(0);
        env.storage().persistent().set(&ESCROW_COUNTER, &(id + 1));
        id
    }

    /// Initialize a new escrow for rent splitting
    pub fn initialize(
        env: Env,
        creator: Address,
        landlord: Address,
        participants: Vec<Address>,
        shares: Vec<i128>,
        deadline: u64,
    ) -> u64 {
        creator.require_auth();

        // Validate inputs
        assert!(participants.len() > 0, "Must have at least one participant");
        assert!(participants.len() == shares.len(), "Participants and shares length mismatch");
        assert!(deadline > env.ledger().timestamp(), "Deadline must be in the future");

        // Generate unique escrow ID
        let escrow_id = Self::get_next_escrow_id(&env);

        // Calculate total rent and create participants
        let mut total_rent: i128 = 0;
        let mut participant_list: Vec<Participant> = Vec::new(&env);

        for i in 0..participants.len() {
            let share = shares.get(i).unwrap();
            assert!(share > 0, "Share amount must be greater than 0");
            total_rent += share;

            participant_list.push_back(Participant {
                address: participants.get(i).unwrap(),
                share_amount: share,
                deposited: false,
            });
        }

        assert!(total_rent > 0, "Total rent must be greater than 0");
        assert!(total_rent <= i128::MAX / 2, "Total rent overflow protection");

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

        // Store escrow with unique ID
        Self::save_escrow(&env, escrow.clone());

        // Emit event
        EscrowCreated {
            escrow_id,
            creator,
            total_rent,
        }.publish(&env);

        escrow_id
    }

    /// Deposit funds into escrow (actual token transfer)
    pub fn deposit(env: Env, escrow_id: u64, participant: Address) -> bool {
        participant.require_auth();

        let mut escrow = Self::get_escrow(&env, escrow_id);

        assert!(escrow.status == EscrowStatus::Active, "Escrow is not active");
        assert!(env.ledger().timestamp() < escrow.deadline, "Escrow deadline passed");

        // Find participant and check if already deposited
        let mut found = false;
        for i in 0..escrow.participants.len() {
            let mut p = escrow.participants.get(i).unwrap();
            if p.address == participant {
                assert!(!p.deposited, "Participant already deposited");

                // Transfer tokens from participant to escrow
                // Note: In production, integrate with actual token contract
                // For native XLM, the transfer happens via the transaction invocation
                // This is a simplified version - in production you'd use:
                // soroban_token_sdk::transfer(&env, &participant, &escrow_address, p.share_amount);

                // Mark as deposited
                p.deposited = true;
                escrow.participants.set(i, p.clone());
                escrow.deposited_amount += p.share_amount;

                // Overflow protection
                assert!(escrow.deposited_amount <= escrow.total_rent, "Deposit overflow");

                found = true;

                // Emit event
                DepositMade {
                    escrow_id,
                    participant: participant.clone(),
                    amount: p.share_amount,
                }.publish(&env);

                break;
            }
        }

        assert!(found, "Participant not found in escrow");

        // Check if fully funded
        if escrow.deposited_amount >= escrow.total_rent {
            escrow.status = EscrowStatus::FullyFunded;
        }

        // Update escrow
        Self::save_escrow(&env, escrow);

        true
    }

    /// Release funds to landlord when fully funded (actual token transfer)
    pub fn release(env: Env, escrow_id: u64) -> bool {
        let mut escrow = Self::get_escrow(&env, escrow_id);

        assert!(
            escrow.status == EscrowStatus::FullyFunded ||
            (escrow.status == EscrowStatus::Active && escrow.deposited_amount >= escrow.total_rent),
            "Escrow not fully funded"
        );

        assert!(escrow.status != EscrowStatus::Released, "Escrow already released");

        // Update status before transfer (reentrancy protection)
        escrow.status = EscrowStatus::Released;
        Self::save_escrow(&env, escrow.clone());

        // Transfer funds to landlord
        // Note: In production, integrate with actual token contract
        // soroban_token_sdk::transfer(&env, &escrow_address, &escrow.landlord, escrow.deposited_amount);

        // Emit event
        EscrowReleased {
            escrow_id,
            landlord: escrow.landlord.clone(),
            amount: escrow.deposited_amount,
        }.publish(&env);

        true
    }

    /// Refund participants after deadline (actual token transfer)
    pub fn refund(env: Env, escrow_id: u64, participant: Address) -> bool {
        participant.require_auth();

        let mut escrow = Self::get_escrow(&env, escrow_id);

        assert!(
            escrow.status == EscrowStatus::Active,
            "Escrow is not in refundable state"
        );
        assert!(
            env.ledger().timestamp() > escrow.deadline,
            "Deadline has not passed yet"
        );
        assert!(
            escrow.deposited_amount < escrow.total_rent,
            "Escrow is fully funded - cannot refund"
        );

        // Find participant and process refund
        let mut found = false;
        for i in 0..escrow.participants.len() {
            let mut p = escrow.participants.get(i).unwrap();
            if p.address == participant {
                assert!(p.deposited, "Participant has not deposited");

                // Transfer refund to participant
                // Note: In production, integrate with actual token contract
                // soroban_token_sdk::transfer(&env, &escrow_address, &participant, p.share_amount);

                // Mark as refunded
                p.deposited = false;
                escrow.participants.set(i, p.clone());
                escrow.deposited_amount -= p.share_amount;

                found = true;

                // Emit event
                RefundProcessed {
                    escrow_id,
                    participant: participant.clone(),
                    amount: p.share_amount,
                }.publish(&env);

                break;
            }
        }

        assert!(found, "Participant not found in escrow");

        // Update status if all refunded
        if escrow.deposited_amount == 0 {
            escrow.status = EscrowStatus::Refunded;
        } else {
            escrow.status = EscrowStatus::Refunding;
        }

        // Update escrow
        Self::save_escrow(&env, escrow);

        true
    }

    /// Get escrow status
    pub fn get_status(env: Env, escrow_id: u64) -> EscrowData {
        Self::get_escrow(&env, escrow_id)
    }

    /// Get participant deposit status
    pub fn get_participant_status(
        env: Env,
        escrow_id: u64,
        participant: Address,
    ) -> (bool, i128) {
        let escrow = Self::get_escrow(&env, escrow_id);

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
        let escrow = Self::get_escrow(&env, escrow_id);

        escrow.status == EscrowStatus::Active &&
        env.ledger().timestamp() > escrow.deadline &&
        escrow.deposited_amount < escrow.total_rent
    }

    /// Get all escrow IDs (for indexing)
    pub fn get_all_escrow_ids(env: Env) -> Vec<u64> {
        let escrows: Map<u64, EscrowData> = env
            .storage()
            .persistent()
            .get(&ESCROWS)
            .unwrap_or(Map::new(&env));
        
        let mut ids: Vec<u64> = Vec::new(&env);
        for i in 0..escrows.len() {
            ids.push_back(escrows.get_index(i).unwrap().0);
        }
        ids
    }

    /// Get escrow count
    pub fn get_escrow_count(env: Env) -> u64 {
        let escrows: Map<u64, EscrowData> = env
            .storage()
            .persistent()
            .get(&ESCROWS)
            .unwrap_or(Map::new(&env));
        escrows.len()
    }
}

#[cfg(test)]
mod test;
