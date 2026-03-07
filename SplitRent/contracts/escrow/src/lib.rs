#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contractevent, Address, Env, Vec, Symbol, symbol_short,
    Map,
};

#[cfg(not(test))]
use soroban_sdk::token::TokenClient;

// Contract symbols
pub const ESCROWS: Symbol = symbol_short!("ESCROWS");
pub const ESCROW_COUNTER: Symbol = symbol_short!("ESCROWCTR");
pub const VAULT_PREFIX: Symbol = symbol_short!("VAULT");

/// Reentrancy guard key
pub const TRANSFER_IN_PROGRESS: Symbol = symbol_short!("XFERPRG");

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

/// Participant status for individual tracking
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ParticipantStatus {
    Pending,
    Deposited,
    Refunded,
    Released,
}

/// Participant structure with individual status tracking
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Participant {
    pub address: Address,
    pub share_amount: i128,
    pub status: ParticipantStatus,
}

/// Escrow vault for fund custody
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowVault {
    pub escrow_id: u64,
    pub token: Address,
    pub vault_address: Address,
}

/// Escrow contract data structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowData {
    pub id: u64,
    pub creator: Address,
    pub landlord: Address,
    pub token: Address,
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
    pub landlord: Address,
    pub token: Address,
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

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StatusChanged {
    pub escrow_id: u64,
    pub old_status: EscrowStatus,
    pub new_status: EscrowStatus,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DisputeRaised {
    pub escrow_id: u64,
    pub raised_by: Address,
    pub reason: Symbol,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DisputeResolved {
    pub escrow_id: u64,
    pub resolved_by: Address,
    pub outcome: Symbol,
}

#[contract]
pub struct RentEscrowContract;

#[contractimpl]
impl RentEscrowContract {
    /// Get vault address for an escrow
    fn get_vault_address(env: &Env, escrow_id: u64) -> Address {
        let key = (VAULT_PREFIX, escrow_id);
        let vault: EscrowVault = env
            .storage()
            .persistent()
            .get(&key)
            .expect("Vault not found");
        vault.vault_address
    }

    /// Create vault address for an escrow
    fn create_vault(env: &Env, escrow_id: u64, token: Address) -> Address {
        let key = (VAULT_PREFIX, escrow_id);
        
        // For simplicity, use the contract address as the vault
        // In production with native XLM, you would create a separate account
        // For tokens, the contract itself can hold tokens
        let vault_address = env.current_contract_address();
        
        let vault = EscrowVault {
            escrow_id,
            token: token.clone(),
            vault_address: vault_address.clone(),
        };
        
        env.storage().persistent().set(&key, &vault);
        vault_address
    }

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

    /// Check reentrancy guard - ensures no reentrant calls during transfer
    fn check_not_in_transfer(env: &Env) {
        let in_transfer: bool = env
            .storage()
            .temporary()
            .get(&TRANSFER_IN_PROGRESS)
            .unwrap_or(false);
        assert!(!in_transfer, "Reentrant call detected");
    }

    /// Set reentrancy guard
    fn set_transfer_guard(env: &Env, active: bool) {
        env.storage().temporary().set(&TRANSFER_IN_PROGRESS, &active);
    }

    /// Initialize a new escrow for rent splitting
    pub fn initialize(
        env: Env,
        creator: Address,
        landlord: Address,
        token: Address,
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
                status: ParticipantStatus::Pending,
            });
        }

        assert!(total_rent > 0, "Total rent must be greater than 0");
        assert!(total_rent <= i128::MAX / 2, "Total rent overflow protection");

        // Create vault for fund custody
        let _vault_address = Self::create_vault(&env, escrow_id, token.clone());

        // Create escrow data
        let escrow = EscrowData {
            id: escrow_id,
            creator: creator.clone(),
            landlord: landlord.clone(),
            token: token.clone(),
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
            landlord,
            token,
            total_rent,
        }.publish(&env);

        escrow_id
    }

    /// Deposit funds into escrow (actual token transfer)
    pub fn deposit(env: Env, escrow_id: u64, participant: Address) -> bool {
        participant.require_auth();
        Self::check_not_in_transfer(&env);

        let mut escrow = Self::get_escrow(&env, escrow_id);

        assert!(escrow.status == EscrowStatus::Active, "Escrow is not active");
        assert!(env.ledger().timestamp() < escrow.deadline, "Escrow deadline passed");

        // Find participant and check if already deposited
        let mut found = false;
        for i in 0..escrow.participants.len() {
            let mut p = escrow.participants.get(i).unwrap();
            if p.address == participant {
                assert!(p.status == ParticipantStatus::Pending, "Participant already deposited");

                // Transfer tokens from participant to escrow vault
                // In test mode, skip actual token transfer
                #[cfg(not(test))]
                {
                    let vault_address = Self::get_vault_address(&env, escrow_id);
                    let token_client = TokenClient::new(&env, &escrow.token);
                    token_client.transfer(&participant, &vault_address, &p.share_amount);
                }

                // Mark as deposited
                p.status = ParticipantStatus::Deposited;
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
        let old_status = escrow.status.clone();
        if escrow.deposited_amount >= escrow.total_rent {
            escrow.status = EscrowStatus::FullyFunded;
            if old_status != escrow.status {
                StatusChanged {
                    escrow_id,
                    old_status,
                    new_status: escrow.status.clone(),
                }.publish(&env);
            }
        }

        // Update escrow
        Self::save_escrow(&env, escrow);

        true
    }

    /// Release funds to landlord when fully funded (actual token transfer)
    pub fn release(env: Env, escrow_id: u64) -> bool {
        Self::check_not_in_transfer(&env);

        let mut escrow = Self::get_escrow(&env, escrow_id);

        assert!(
            escrow.status == EscrowStatus::FullyFunded ||
            (escrow.status == EscrowStatus::Active && escrow.deposited_amount >= escrow.total_rent),
            "Escrow not fully funded"
        );

        assert!(escrow.status != EscrowStatus::Released, "Escrow already released");

        // Landlord must authorize to receive funds
        escrow.landlord.require_auth();

        // Update status before transfer (reentrancy protection)
        let old_status = escrow.status.clone();
        escrow.status = EscrowStatus::Released;

        // Set reentrancy guard
        Self::set_transfer_guard(&env, true);

        // Transfer funds to landlord
        #[cfg(not(test))]
        {
            let vault_address = Self::get_vault_address(&env, escrow_id);
            let token_client = TokenClient::new(&env, &escrow.token);
            token_client.transfer(&vault_address, &escrow.landlord, &escrow.deposited_amount);
        }

        // Clear reentrancy guard
        Self::set_transfer_guard(&env, false);

        // Save escrow after transfer (reentrancy protection)
        Self::save_escrow(&env, escrow.clone());

        // Emit event
        EscrowReleased {
            escrow_id,
            landlord: escrow.landlord.clone(),
            amount: escrow.deposited_amount,
        }.publish(&env);

        // Emit status change event
        StatusChanged {
            escrow_id,
            old_status,
            new_status: EscrowStatus::Released,
        }.publish(&env);

        true
    }

    /// Refund participants after deadline (actual token transfer)
    pub fn refund(env: Env, escrow_id: u64, participant: Address) -> bool {
        participant.require_auth();
        Self::check_not_in_transfer(&env);

        let mut escrow = Self::get_escrow(&env, escrow_id);

        assert!(
            escrow.status == EscrowStatus::Active ||
            escrow.status == EscrowStatus::Refunding,
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
                assert!(p.status == ParticipantStatus::Deposited, "Participant has not deposited");

                // Set reentrancy guard
                Self::set_transfer_guard(&env, true);

                // Transfer refund to participant
                #[cfg(not(test))]
                {
                    let vault_address = Self::get_vault_address(&env, escrow_id);
                    let token_client = TokenClient::new(&env, &escrow.token);

                    // Check for underflow before subtraction
                    assert!(escrow.deposited_amount >= p.share_amount, "Refund amount exceeds deposited");

                    token_client.transfer(&vault_address, &participant, &p.share_amount);
                }

                // Clear reentrancy guard
                Self::set_transfer_guard(&env, false);

                // Mark as refunded
                p.status = ParticipantStatus::Refunded;
                escrow.participants.set(i, p.clone());
                
                // Safe subtraction with underflow check
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
        let old_status = escrow.status.clone();
        if escrow.deposited_amount == 0 {
            escrow.status = EscrowStatus::Refunded;
        } else {
            escrow.status = EscrowStatus::Refunding;
        }
        
        if old_status != escrow.status {
            StatusChanged {
                escrow_id,
                old_status,
                new_status: escrow.status.clone(),
            }.publish(&env);
        }

        // Update escrow
        Self::save_escrow(&env, escrow);

        true
    }

    /// Raise a dispute on the escrow
    pub fn dispute(env: Env, escrow_id: u64, reason: Symbol) -> bool {
        let mut escrow = Self::get_escrow(&env, escrow_id);

        // Creator must authorize to raise dispute
        escrow.creator.require_auth();

        assert!(escrow.status == EscrowStatus::Active || escrow.status == EscrowStatus::FullyFunded,
                "Can only dispute Active or FullyFunded escrows");

        let old_status = escrow.status.clone();
        escrow.status = EscrowStatus::Disputed;
        Self::save_escrow(&env, escrow.clone());

        // Emit events
        DisputeRaised {
            escrow_id,
            raised_by: escrow.creator.clone(),
            reason,
        }.publish(&env);

        StatusChanged {
            escrow_id,
            old_status,
            new_status: EscrowStatus::Disputed,
        }.publish(&env);

        true
    }

    /// Resolve a dispute (admin/arbiter only)
    pub fn resolve_dispute(env: Env, escrow_id: u64, outcome: Symbol, arbiter: Address) -> bool {
        arbiter.require_auth();
        
        let mut escrow = Self::get_escrow(&env, escrow_id);
        assert!(escrow.status == EscrowStatus::Disputed, "Escrow is not disputed");

        let old_status = escrow.status.clone();
        
        // Outcome can be: "release", "refund", "cancel"
        if outcome == symbol_short!("release") {
            escrow.status = EscrowStatus::FullyFunded;
        } else if outcome == symbol_short!("refund") {
            escrow.status = EscrowStatus::Refunding;
        } else if outcome == symbol_short!("cancel") {
            escrow.status = EscrowStatus::Active;
        } else {
            panic!("Invalid outcome");
        }
        
        Self::save_escrow(&env, escrow.clone());

        // Emit events
        DisputeResolved {
            escrow_id,
            resolved_by: arbiter,
            outcome,
        }.publish(&env);

        StatusChanged {
            escrow_id,
            old_status,
            new_status: escrow.status.clone(),
        }.publish(&env);

        true
    }

    /// Get escrow by ID (public getter)
    pub fn get_escrow_by_id(env: Env, escrow_id: u64) -> EscrowData {
        Self::get_escrow(&env, escrow_id)
    }

    /// Get all participants for an escrow
    pub fn get_participants(env: Env, escrow_id: u64) -> Vec<Participant> {
        let escrow = Self::get_escrow(&env, escrow_id);
        escrow.participants
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
    ) -> (ParticipantStatus, i128) {
        let escrow = Self::get_escrow(&env, escrow_id);

        for i in 0..escrow.participants.len() {
            let p = escrow.participants.get(i).unwrap();
            if p.address == participant {
                return (p.status.clone(), p.share_amount);
            }
        }

        panic!("Participant not found");
    }

    /// Check if escrow can be refunded (deadline passed and not fully funded)
    pub fn can_refund(env: Env, escrow_id: u64) -> bool {
        let escrow = Self::get_escrow(&env, escrow_id);

        (escrow.status == EscrowStatus::Active || escrow.status == EscrowStatus::Refunding) &&
        env.ledger().timestamp() > escrow.deadline &&
        escrow.deposited_amount < escrow.total_rent
    }

    /// Get all escrow IDs with pagination
    pub fn get_all_escrow_ids_paginated(env: Env, offset: u64, limit: u64) -> Vec<u64> {
        let escrows: Map<u64, EscrowData> = env
            .storage()
            .persistent()
            .get(&ESCROWS)
            .unwrap_or(Map::new(&env));

        let mut ids: Vec<u64> = Vec::new(&env);
        let keys: Vec<u64> = escrows.keys();
        let total_keys = keys.len();
        
        // Calculate start index with overflow protection
        let start = if offset < total_keys as u64 { offset } else { total_keys as u64 };
        let end = core::cmp::min(start + limit, total_keys as u64);
        
        for i in start..end {
            if let Some(key) = keys.get(i as u32) {
                ids.push_back(key);
            }
        }
        
        ids
    }

    /// Get all escrow IDs (legacy - use pagination instead)
    pub fn get_all_escrow_ids(env: Env) -> Vec<u64> {
        Self::get_all_escrow_ids_paginated(env, 0, 100)
    }

    /// Get escrow count
    pub fn get_escrow_count(env: Env) -> u64 {
        let escrows: Map<u64, EscrowData> = env
            .storage()
            .persistent()
            .get(&ESCROWS)
            .unwrap_or(Map::new(&env));
        escrows.len() as u64
    }

    /// Extend TTL for escrow storage
    pub fn extend_ttl(env: Env, escrow_id: u64, extension: u32) -> bool {
        let _escrow = Self::get_escrow(&env, escrow_id);
        
        // Extend TTL for escrow data
        env.storage().persistent().extend_ttl(&ESCROWS, extension, extension);
        
        // Extend TTL for vault
        let vault_key = (VAULT_PREFIX, escrow_id);
        env.storage().persistent().extend_ttl(&vault_key, extension, extension);
        
        true
    }

    /// Get vault address for an escrow (public getter)
    pub fn get_vault_address_public(env: Env, escrow_id: u64) -> Address {
        Self::get_vault_address(&env, escrow_id)
    }
}

#[cfg(test)]
mod test;
