#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Ledger, vec, Env, Address};

fn create_test_address(env: &Env, seed: &[u8]) -> Address {
    Address::generate(env)
}

#[test]
fn test_initialize_escrow() {
    let env = Env::default();
    env.mock_all_auths();
    
    let creator = create_test_address(&env, b"creator");
    let landlord = create_test_address(&env, b"landlord");
    let participant1 = create_test_address(&env, b"p1");
    let participant2 = create_test_address(&env, b"p2");
    
    let participants = vec![&env, participant1.clone(), participant2.clone()];
    let shares = vec![&env, 500_0000000_i128, 500_0000000_i128]; // 500 XLM each
    let deadline = env.ledger().timestamp() + 86400; // 24 hours from now
    
    let escrow_id = RentEscrowContract::initialize(
        &env,
        creator.clone(),
        landlord.clone(),
        participants,
        shares,
        deadline,
    );
    
    let escrow = RentEscrowContract::get_status(&env, escrow_id);
    
    assert_eq!(escrow.id, escrow_id);
    assert_eq!(escrow.creator, creator);
    assert_eq!(escrow.landlord, landlord);
    assert_eq!(escrow.total_rent, 1000_0000000_i128);
    assert_eq!(escrow.status, EscrowStatus::Active);
    assert_eq!(escrow.participants.len(), 2);
}

#[test]
fn test_deposit() {
    let env = Env::default();
    env.mock_all_auths();
    
    let creator = create_test_address(&env, b"creator");
    let landlord = create_test_address(&env, b"landlord");
    let participant1 = create_test_address(&env, b"p1");
    
    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 86400;
    
    let escrow_id = RentEscrowContract::initialize(
        &env,
        creator,
        landlord,
        participants,
        shares,
        deadline,
    );
    
    // First deposit
    let deposited = RentEscrowContract::deposit(&env, escrow_id, participant1.clone());
    assert!(deposited);
    
    let (has_deposited, share) = RentEscrowContract::get_participant_status(&env, escrow_id, participant1.clone());
    assert!(has_deposited);
    assert_eq!(share, 500_0000000_i128);
    
    let escrow = RentEscrowContract::get_status(&env, escrow_id);
    assert_eq!(escrow.deposited_amount, 500_0000000_i128);
    assert_eq!(escrow.status, EscrowStatus::FullyFunded);
}

#[test]
#[should_panic(expected = "Participant already deposited")]
fn test_double_deposit_panics() {
    let env = Env::default();
    env.mock_all_auths();
    
    let creator = create_test_address(&env, b"creator");
    let landlord = create_test_address(&env, b"landlord");
    let participant1 = create_test_address(&env, b"p1");
    
    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 86400;
    
    let escrow_id = RentEscrowContract::initialize(
        &env,
        creator,
        landlord,
        participants,
        shares,
        deadline,
    );
    
    // First deposit
    RentEscrowContract::deposit(&env, escrow_id, participant1.clone());
    
    // Second deposit should panic
    RentEscrowContract::deposit(&env, escrow_id, participant1.clone());
}

#[test]
fn test_can_refund() {
    let env = Env::default();
    env.mock_all_auths();
    
    let creator = create_test_address(&env, b"creator");
    let landlord = create_test_address(&env, b"landlord");
    let participant1 = create_test_address(&env, b"p1");
    
    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 100; // 100 seconds from now
    
    let escrow_id = RentEscrowContract::initialize(
        &env,
        creator,
        landlord,
        participants,
        shares,
        deadline,
    );
    
    // Before deadline, can't refund
    assert!(!RentEscrowContract::can_refund(&env, escrow_id));
    
    // Advance time past deadline
    env.ledger().with_mut(|li| {
        li.timestamp = deadline + 1000;
    });
    
    // After deadline, can refund
    assert!(RentEscrowContract::can_refund(&env, escrow_id));
}

#[test]
#[should_panic(expected = "Deadline must be in the future")]
fn test_past_deadline_panics() {
    let env = Env::default();
    env.mock_all_auths();
    
    let creator = create_test_address(&env, b"creator");
    let landlord = create_test_address(&env, b"landlord");
    let participant1 = create_test_address(&env, b"p1");
    
    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = env.ledger().timestamp() - 1000; // Past deadline
    
    RentEscrowContract::initialize(
        &env,
        creator,
        landlord,
        participants,
        shares,
        deadline,
    );
}
