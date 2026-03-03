#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, vec, Env};

fn create_test_address(env: &Env) -> Address {
    Address::generate(env)
}

#[test]
fn test_initialize_escrow() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);
    
    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let participant1 = create_test_address(&env);
    let participant2 = create_test_address(&env);
    
    let participants = vec![&env, participant1.clone(), participant2.clone()];
    let shares = vec![&env, 500_0000000_i128, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 86400;
    
    let escrow_id = client.initialize(&creator, &landlord, &participants, &shares, &deadline);
    
    let escrow = client.get_status(&escrow_id);
    
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
    
    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);
    
    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let participant1 = create_test_address(&env);
    
    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 86400;
    
    let escrow_id = client.initialize(&creator, &landlord, &participants, &shares, &deadline);
    
    // First deposit
    let deposited = client.deposit(&escrow_id, &participant1);
    assert!(deposited);
    
    let (has_deposited, share) = client.get_participant_status(&escrow_id, &participant1);
    assert!(has_deposited);
    assert_eq!(share, 500_0000000_i128);
    
    let escrow = client.get_status(&escrow_id);
    assert_eq!(escrow.deposited_amount, 500_0000000_i128);
    assert_eq!(escrow.status, EscrowStatus::FullyFunded);
}

#[test]
#[should_panic(expected = "Escrow is not active")]
fn test_double_deposit_panics() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);
    
    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let participant1 = create_test_address(&env);
    
    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 86400;
    
    let escrow_id = client.initialize(&creator, &landlord, &participants, &shares, &deadline);
    
    // First deposit
    client.deposit(&escrow_id, &participant1);
    
    // Second deposit should panic
    client.deposit(&escrow_id, &participant1);
}

#[test]
fn test_can_refund() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);
    
    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let participant1 = create_test_address(&env);
    
    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 100;
    
    let escrow_id = client.initialize(&creator, &landlord, &participants, &shares, &deadline);
    
    // Before deadline, can't refund
    assert!(!client.can_refund(&escrow_id));
    
    // Advance time past deadline
    env.ledger().with_mut(|li| {
        li.timestamp = deadline + 1000;
    });
    
    // After deadline, can refund
    assert!(client.can_refund(&escrow_id));
}

#[test]
#[should_panic(expected = "Deadline must be in the future")]
fn test_past_deadline_panics() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);
    
    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let participant1 = create_test_address(&env);
    
    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = 0u64;
    
    client.initialize(&creator, &landlord, &participants, &shares, &deadline);
}
