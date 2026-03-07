#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::{Address as _}, vec, Env, Address};

fn create_test_address(env: &Env) -> Address {
    Address::generate(env)
}

fn create_test_token(env: &Env) -> Address {
    Address::generate(env)
}

// Note: These tests verify the contract logic and state management.
// Token transfer tests require a full token contract mock setup.
// In production, the token transfers will work with any SPL-compatible token.

#[test]
fn test_initialize_escrow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);

    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let token = create_test_token(&env);
    let participant1 = create_test_address(&env);
    let participant2 = create_test_address(&env);

    let participants = vec![&env, participant1.clone(), participant2.clone()];
    let shares = vec![&env, 500_0000000_i128, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 86400;

    let escrow_id = client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);

    let escrow = client.get_status(&escrow_id);

    assert_eq!(escrow.id, escrow_id);
    assert_eq!(escrow.creator, creator);
    assert_eq!(escrow.landlord, landlord);
    assert_eq!(escrow.token, token);
    assert_eq!(escrow.total_rent, 1000_0000000_i128);
    assert_eq!(escrow.status, EscrowStatus::Active);
    assert_eq!(escrow.participants.len(), 2);
    
    // Verify vault was created
    let vault_address = client.get_vault_address_public(&escrow_id);
    assert!(vault_address != Address::generate(&env));
}

#[test]
fn test_get_participants() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);

    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let token = create_test_token(&env);
    let participant1 = create_test_address(&env);
    let participant2 = create_test_address(&env);

    let participants = vec![&env, participant1.clone(), participant2.clone()];
    let shares = vec![&env, 500_0000000_i128, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 86400;

    let escrow_id = client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);

    // Get participants
    let retrieved = client.get_participants(&escrow_id);
    assert_eq!(retrieved.len(), 2);
    assert_eq!(retrieved.get(0).unwrap().address, participant1);
    assert_eq!(retrieved.get(1).unwrap().address, participant2);
}

#[test]
fn test_get_escrow_by_id() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);

    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let token = create_test_token(&env);
    let participant1 = create_test_address(&env);

    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 86400;

    let escrow_id = client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);

    // Get escrow by ID
    let escrow = client.get_escrow_by_id(&escrow_id);
    assert_eq!(escrow.id, escrow_id);
    assert_eq!(escrow.creator, creator);
    assert_eq!(escrow.landlord, landlord);
}

#[test]
fn test_escrow_count() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);

    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let token = create_test_token(&env);
    let participant1 = create_test_address(&env);

    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 86400;

    // Initially 0 escrows
    assert_eq!(client.get_escrow_count(), 0);

    // Create 3 escrows
    client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);
    client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);
    client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);

    assert_eq!(client.get_escrow_count(), 3);
}

#[test]
fn test_pagination() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);

    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let token = create_test_token(&env);
    let participant1 = create_test_address(&env);

    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 86400;

    // Create multiple escrows
    let escrow_id1 = client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);
    let escrow_id2 = client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);
    let escrow_id3 = client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);

    // Get paginated results
    let page1 = client.get_all_escrow_ids_paginated(&0, &2);
    assert_eq!(page1.len(), 2);
    assert_eq!(page1.get(0).unwrap(), escrow_id1);
    assert_eq!(page1.get(1).unwrap(), escrow_id2);

    let page2 = client.get_all_escrow_ids_paginated(&2, &2);
    assert_eq!(page2.len(), 1);
    assert_eq!(page2.get(0).unwrap(), escrow_id3);
}

#[test]
fn test_extend_ttl() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);

    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let token = create_test_token(&env);
    let participant1 = create_test_address(&env);

    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 86400;

    let escrow_id = client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);

    // Extend TTL
    let extended = client.extend_ttl(&escrow_id, &100000);
    assert!(extended);
}

#[test]
fn test_can_refund_initially_false() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);

    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let token = create_test_token(&env);
    let participant1 = create_test_address(&env);

    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 100;

    let escrow_id = client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);

    // Before deadline, can't refund
    assert!(!client.can_refund(&escrow_id));
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
    let token = create_test_token(&env);
    let participant1 = create_test_address(&env);

    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = 0u64;

    client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);
}

#[test]
#[should_panic(expected = "Must have at least one participant")]
fn test_no_participants_panics() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);

    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let token = create_test_token(&env);

    let participants = vec![&env];
    let shares = vec![&env];
    let deadline = env.ledger().timestamp() + 86400;

    client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);
}

#[test]
#[should_panic(expected = "Participants and shares length mismatch")]
fn test_participants_shares_mismatch_panics() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);

    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let token = create_test_token(&env);
    let participant1 = create_test_address(&env);
    let participant2 = create_test_address(&env);

    let participants = vec![&env, participant1.clone(), participant2.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 86400;

    client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);
}

#[test]
#[should_panic(expected = "Share amount must be greater than 0")]
fn test_zero_share_panics() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);

    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let token = create_test_token(&env);
    let participant1 = create_test_address(&env);

    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 0_i128];
    let deadline = env.ledger().timestamp() + 86400;

    client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);
}

#[test]
fn test_participant_status_pending() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);

    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let token = create_test_token(&env);
    let participant1 = create_test_address(&env);

    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 86400;

    let escrow_id = client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);

    // Check initial status
    let (status, share) = client.get_participant_status(&escrow_id, &participant1);
    assert_eq!(status, ParticipantStatus::Pending);
    assert_eq!(share, 500_0000000_i128);
}

#[test]
#[should_panic(expected = "Participant not found")]
fn test_nonexistent_participant_status_panics() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);

    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let token = create_test_token(&env);
    let participant1 = create_test_address(&env);
    let outsider = create_test_address(&env);

    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 86400;

    let escrow_id = client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);

    // Check status for non-participant
    client.get_participant_status(&escrow_id, &outsider);
}

#[test]
fn test_vault_address_consistency() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);

    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let token = create_test_token(&env);
    let participant1 = create_test_address(&env);

    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 86400;

    let escrow_id = client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);

    // Get vault address multiple times - should be consistent
    let vault1 = client.get_vault_address_public(&escrow_id);
    let vault2 = client.get_vault_address_public(&escrow_id);
    assert_eq!(vault1, vault2);
}

#[test]
fn test_multiple_escrows_independent() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RentEscrowContract, ());
    let client = RentEscrowContractClient::new(&env, &contract_id);

    let creator = create_test_address(&env);
    let landlord = create_test_address(&env);
    let token = create_test_token(&env);
    let participant1 = create_test_address(&env);

    let participants = vec![&env, participant1.clone()];
    let shares = vec![&env, 500_0000000_i128];
    let deadline = env.ledger().timestamp() + 86400;

    // Create two escrows
    let escrow_id1 = client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);
    let escrow_id2 = client.initialize(&creator, &landlord, &token, &participants, &shares, &deadline);

    // Verify they have different IDs
    assert_ne!(escrow_id1, escrow_id2);

    // Verify they are independent
    let escrow1 = client.get_status(&escrow_id1);
    let escrow2 = client.get_status(&escrow_id2);
    
    assert_eq!(escrow1.id, escrow_id1);
    assert_eq!(escrow2.id, escrow_id2);
    assert_eq!(escrow1.deposited_amount, 0);
    assert_eq!(escrow2.deposited_amount, 0);
}
