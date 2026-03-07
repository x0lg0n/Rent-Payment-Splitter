# Contributing to SplitRent

Thank you for your interest in contributing to SplitRent! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in your interactions. We're building an inclusive community focused on helping roommates manage rent payments efficiently.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as the problem might already be documented. When creating a bug report, include:

- A clear and descriptive title
- Detailed description of the issue
- Steps to reproduce the behavior
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (browser, OS, wallet extension)

**Example:**

```md
**Bug Summary**
Wallet connection fails after page refresh

**Steps to Reproduce**

1. Connect Freighter wallet
2. Refresh the page
3. Wallet shows disconnected state

**Expected:** Wallet should reconnect automatically
**Actual:** User must manually reconnect
```

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- Use case for the feature
- Clear description of proposed functionality
- Any relevant examples or mockups

### Pull Requests

Before submitting a PR:

1. Fork the repository and create your branch from `main`
2. Follow the project's code style (TypeScript, ESLint rules)
3. Add tests if applicable
4. Ensure all tests pass: `pnpm lint && pnpm typecheck && pnpm test`
5. Update documentation if needed
6. Use conventional commits: `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`

**PR Requirements:**

- Descriptive title following format: `Level <n>: <feature description>`
- Link to related issue if exists
- Description of changes made
- Screenshots for UI changes

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Rent-Payment-Splitter.git
cd Rent-Payment-Splitter/frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Lint and typecheck
pnpm lint && pnpm typecheck
```

## Project Structure

- **Frontend**: Next.js app with TypeScript, Tailwind CSS, shadcn/ui
- **Smart Contracts**: Soroban contracts in Rust (located in `SplitRent/`)
- **Documentation**: Product requirements and plans in `docs/`

## Architecture Overview

SplitRent uses:

- Stellar blockchain for payment transactions
- Soroban smart contracts for escrow management
- Modern React stack for the user interface

Key libraries:

- `@stellar/stellar-sdk` - Stellar blockchain interaction
- `@creit.tech/stellar-wallets-kit` - Multi-wallet support
- Next.js App Router - Routing and server components

## Testing

Run the test suite:

```bash
pnpm test
```

For contract tests:

```bash
cd SplitRent
cargo test
```

## Release Process

The project follows a phase-based release strategy:

- Each phase represents a major milestone
- Branch naming: `phase/<n>-<slug>`
- Tags: `v0.<phase>.0`

## Questions?

Feel free to open an issue for any questions about contributing.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
