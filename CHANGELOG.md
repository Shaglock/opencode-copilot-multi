# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.9] - 2025-01-26

### Added
- Comprehensive README with full documentation
- Architecture overview with ASCII diagrams
- Detailed troubleshooting guide with 5 common scenarios
- Development section with setup and workflow instructions
- Project structure documentation
- Security section explaining token management and file permissions
- Future ideas roadmap

### Changed
- README completely revamped (156 → 631 lines)
- Installation section with 3 options (global, npx, manual)
- CLI commands documentation with examples
- Better model selector format explanation

### Fixed
- Clarified when `install` command is needed (fallback/safety net)

## [1.0.8] - 2025-01-25

### Added
- Initial public release
- Multi-account support for GitHub Copilot
- Custom provider with per-account routing
- Account pool management
- CLI tool with list, add, remove, clear commands
- Automatic token refresh
- Configuration auto-update
- Post-install setup script
- Logging system
- Error handling

### Features
- 🔄 Multi-account support
- 🎯 Per-model account selection
- 🔒 Secure credential storage
- ⚡ Non-blocking lazy loading
- 🔄 Auto-sync account detection

## Version History

### Versioning Strategy
- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (1.1.0): New features (backward compatible)
- **PATCH** (1.0.1): Bug fixes

### Release Cycle
- Regular patch releases for bug fixes
- Monthly minor releases for new features
- Announcement on GitHub releases page

## Unreleased

### Planned for 1.1.0
- [ ] Keychain integration for secure token storage
- [ ] Account settings management (display name, preferences)
- [ ] Per-project default account configuration
- [ ] Web UI for account management
- [ ] Rate limiting per account

### Planned for 1.2.0
- [ ] Automatic account discovery without manual login
- [ ] Account switching via keyboard shortcuts
- [ ] Usage analytics dashboard
- [ ] Token encryption with system keychain

### Long Term
- [ ] Web dashboard for managing accounts
- [ ] Integration with other AI providers
- [ ] Cross-machine account sync
- [ ] Team account management

## Deprecation Policy

Old versions are not actively maintained, but we try to:
- Keep versions working for at least 6 months
- Provide migration guides for breaking changes
- Announce deprecations in release notes 2 versions ahead

## Security Policy

See [SECURITY.md](SECURITY.md) for security-related information and reporting vulnerabilities.
