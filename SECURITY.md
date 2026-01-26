# Security Policy

## 🔒 Overview

This document outlines the security practices and vulnerability reporting process for opencode-copilot-multi.

## Supported Versions

| Version | Status | Support Until |
|---------|--------|---------------|
| 1.0.x | Current | Ongoing |
| < 1.0.0 | Unsupported | N/A |

We recommend always using the latest version for security updates.

## 🛡️ Security Practices

### Token Management

**Storage**
- OAuth tokens stored in `~/.local/share/opencode/copilot-multi-accounts.json`
- File permissions: 0600 (readable only by owner)
- No tokens in environment variables
- No tokens in logs or debug output

**Refresh**
- Access tokens automatically refreshed 5 minutes before expiry
- Refresh tokens used to obtain new access tokens
- Mutex pattern prevents concurrent refresh attempts
- Tokens stored encrypted in pool file

**Expiration**
- `gho_*` tokens (personal access): Never expire, managed by GitHub
- `ghu_*` tokens (user auth): 8 hours default, auto-refreshed
- All tokens validated before use

### Credential Security

**What We Store**
```json
{
  "access": "ghu_...",      // Short-lived access token
  "refresh": "ghr_...",     // Used to get new access tokens
  "expires": 1704067200000  // Expiration timestamp
}
```

**What We DON'T Store**
- Passwords ❌
- API keys ❌
- Refresh tokens in clear text (depends on file permissions) ⚠️
- Session data ❌

### File Permissions

```bash
# Pool file with account credentials
-rw------- user staff copilot-multi-accounts.json

# Config file (publicly readable)
-rw-r--r-- user staff opencode.json
```

### Secure Defaults

- No credentials in git repository
- No debug output containing tokens
- No credentials in command-line arguments
- No telemetry or home-phone calls

## 🐛 Reporting Security Vulnerabilities

If you discover a security vulnerability, please **DO NOT** open a public GitHub issue.

### Private Disclosure Process

1. **Email the maintainer**
   - To: [security contact via GitHub]
   - Subject: "Security Vulnerability in opencode-copilot-multi"

2. **Include**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)
   - Your contact information

3. **Response Timeline**
   - Acknowledgment: Within 24 hours
   - Initial assessment: Within 72 hours
   - Fix release: Within 1-2 weeks (or more for complex issues)

4. **Public Disclosure**
   - Fixed version released first
   - Security advisory published
   - Credit given to reporter (if desired)

## 🔍 Security Checks

### Regular Updates
- Dependencies checked regularly for vulnerabilities
- npm audit run before releases
- Known vulnerability fixes applied promptly

### Code Review
- All contributions reviewed for security
- Focus on token handling, file I/O, API calls
- Type safety checked with TypeScript

### Testing
- Manual testing of token refresh flows
- File permission verification
- Error handling for invalid credentials

## 🚨 Known Limitations

### Keychain Integration
Currently, tokens are stored in plain text files with 0600 permissions.

**Considerations**:
- File is readable only by owner
- On shared workstations, only owner can read tokens
- For maximum security, use OS keychain (future release)

**Mitigation**:
- Keep `~/.local/share/opencode/` on encrypted filesystem
- Use full-disk encryption (recommended)
- Don't share system user account
- Rotate tokens periodically

### GitHub API Rate Limits
We make GitHub API calls to:
- Detect username from auth token
- Sync account list

**Rate limit**: 5,000 requests/hour (authenticated)
**Impact**: Minimal - usually 1 call per login

**Mitigation**:
- Cache username after first detection
- Batched account sync operations

### Token Refresh on Network Failure
If network fails during token refresh:
- Request uses existing (still-valid) token
- Retry on next request
- Fails gracefully with clear error

## 📋 Security Checklist

Before each release:

- [ ] Run `npm audit` - no high/critical vulnerabilities
- [ ] Check dependencies for updates
- [ ] Review code changes for security issues
- [ ] Test token refresh flow manually
- [ ] Verify file permissions (0600 for pool file)
- [ ] No credentials in git history
- [ ] No debug output with tokens
- [ ] Update security docs if needed

## 🛠️ Secure Development

### Local Development

```bash
# Never commit these
.env
.env.local
pool-debug.json
auth-debug.json
```

### Testing

```bash
# When testing token refresh:
# 1. Use test accounts only
# 2. Don't commit real tokens
# 3. Clean up test files
# 4. Reset pool after testing

rm ~/.local/share/opencode/copilot-multi-accounts.json
```

### Code Review Focus Areas

Security reviewers should check:

1. **Token Handling**
   - Never logged
   - Never in query strings
   - Proper header injection
   - Secure refresh flow

2. **File I/O**
   - Proper permissions
   - Path traversal prevention
   - Backup creation for corruption

3. **API Calls**
   - HTTPS only
   - Proper headers
   - Error handling
   - Rate limit handling

4. **Error Messages**
   - No token leakage
   - No path disclosure
   - User-friendly messages

## 📞 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security](https://github.com/security)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
- [OAuth 2.0 Security](https://datatracker.ietf.org/doc/html/rfc6749)

## 🔄 Incident Response

If a security incident is discovered:

1. **Assess severity**
   - Critical (0 or immediate action needed)
   - High (fix needed soon)
   - Medium (plan fix)
   - Low (backlog)

2. **Create fix**
   - Private branch
   - Code review
   - Testing

3. **Release**
   - Patch version bump
   - Publish to npm
   - Security advisory

4. **Communicate**
   - GitHub release notes
   - README update (if needed)
   - Credit to reporter

## ✅ Compliance

This project aims to follow:
- OAuth 2.0 security best practices
- OWASP Top 10 principles
- Node.js security guidelines
- GitHub's security recommendations

---

**Last Updated**: January 2025

For security questions or concerns, please reach out privately via GitHub.
