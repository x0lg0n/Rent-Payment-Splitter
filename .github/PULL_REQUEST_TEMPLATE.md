# Pull Request Template

## Description

Please include a summary of the changes and which issue is fixed. Please also include relevant motivation and context.

Fixes # (issue)

## Type of Change

Please delete options that are not relevant.

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring (no functional changes)
- [ ] Test update (adding or updating tests)
- [ ] CI/CD configuration changes
- [ ] Configuration changes (environment variables, configs)

## How Has This Been Tested?

Please describe the tests that you ran to verify your changes. Provide instructions so we can reproduce.

- [ ] Test A (e.g., `pnpm test` passes)
- [ ] Test B (e.g., Manual testing steps)
- [ ] Test C (e.g., Screenshots or video evidence)

**Test Configuration:**

- OS: [e.g., Ubuntu 24.04]
- Browser: [e.g., Chrome 122, Firefox 123]
- Node.js version: [e.g., v20.x]
- pnpm version: [e.g., v9.x]

## Checklist:

Before submitting this PR, please ensure:

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation (README.md, etc.)
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
- [ ] I have run `pnpm lint && pnpm typecheck` without errors
- [ ] I have tested the changes manually in the browser
- [ ] For smart contract changes: I have run `cargo test` successfully

## Screenshots (if applicable)

Add screenshots here if your changes affect the UI.

## Additional Context

Add any other context about the pull request here.

## Related Issues

List any related issues or pull requests:

- Related to #123
- Blocks #456
- Depends on #789

---

**Note for Phase-Based Development:**
If this PR is part of a phase milestone, please mention it in the description.

Example: `Phase 2: Add escrow contract integration`
