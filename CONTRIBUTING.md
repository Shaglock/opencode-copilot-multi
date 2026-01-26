# Contributing to opencode-copilot-multi

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 📋 Code of Conduct

Please be respectful, inclusive, and professional in all interactions. We're building this together!

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.0.0
- npm (comes with Node.js)
- Git
- A GitHub account

### Local Setup

1. **Fork the repository**
   ```bash
   # Go to https://github.com/iamvaleriofantozzi/opencode-copilot-multi
   # Click "Fork" button in top-right corner
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/opencode-copilot-multi.git
   cd opencode-copilot-multi
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/iamvaleriofantozzi/opencode-copilot-multi.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/my-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Use TypeScript for type safety

3. **Watch mode for development**
   ```bash
   npm run watch
   # This rebuilds on every file change
   ```

4. **Test your changes**
   ```bash
   # Manually test the CLI
   npm run build
   npm link
   opencode-copilot-multi list
   ```

5. **Commit with clear messages**
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve issue with token refresh"
   git commit -m "docs: update README section"
   git commit -m "chore: update dependencies"
   ```

   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation
   - `chore:` - Build, deps, etc.
   - `refactor:` - Code restructuring
   - `test:` - Adding tests

6. **Push to your fork**
   ```bash
   git push origin feature/my-feature-name
   ```

7. **Create a Pull Request**
   - Go to https://github.com/YOUR_USERNAME/opencode-copilot-multi
   - Click "Compare & pull request"
   - Fill in the PR template
   - Reference any related issues: `Closes #123`

## 🧪 Testing

### Manual Testing

```bash
# Link globally for testing
npm link

# Test commands
opencode-copilot-multi list
opencode-copilot-multi add
opencode-copilot-multi remove <username>

# Unlink when done
npm unlink -g opencode-copilot-multi
```

### Testing Account Pool

The pool file is located at:
```bash
~/.local/share/opencode/copilot-multi-accounts.json
```

To reset for testing:
```bash
rm ~/.local/share/opencode/copilot-multi-accounts.json
```

### Debugging

Enable debug logging:
```bash
# View logs
tail -f ~/.local/share/opencode/log/copilot-multi.log

# Or check the log file directly
cat ~/.local/share/opencode/log/copilot-multi.log
```

## 📝 Code Style

### TypeScript Guidelines

- Use explicit type annotations
- Avoid `any` type
- Use const by default
- Prefer arrow functions
- Use async/await over promises

### File Structure

```typescript
/**
 * Brief description of what this file does
 */

import { statements }

// Constants
const CONSTANT_NAME = 'value';

// Types/Interfaces
interface MyInterface {
  prop: string;
}

// Main functions
export async function myFunction(): Promise<void> {
  // Implementation
}

// Helper functions
function helperFunction(): void {
  // Implementation
}
```

### Naming Conventions

- `PascalCase` for classes and interfaces
- `camelCase` for variables and functions
- `UPPER_SNAKE_CASE` for constants
- Descriptive names (avoid `a`, `b`, `temp`)

## 🐛 Reporting Issues

### When Creating an Issue

1. **Use clear title**
   - ❌ "Plugin not working"
   - ✅ "Models not appearing after running 'add' command"

2. **Provide context**
   ```markdown
   **System:**
   - OS: macOS 14.2
   - Node.js: 20.10
   - npm: 10.2
   
   **Steps to reproduce:**
   1. Run `opencode-copilot-multi add`
   2. Complete GitHub Copilot auth
   3. Run `opencode-copilot-multi list`
   
   **Expected:**
   Account should appear in the list
   
   **Actual:**
   No accounts listed
   
   **Logs:**
   [Paste relevant log entries]
   ```

3. **Include logs**
   ```bash
   # Include relevant parts of:
   tail -50 ~/.local/share/opencode/log/copilot-multi.log
   ```

4. **Screenshots** (if relevant)
   - Show error messages
   - Show command output

## 🎯 Areas for Contribution

### High Priority

- [ ] Bug fixes reported in issues
- [ ] Error message improvements
- [ ] Troubleshooting docs
- [ ] Logging enhancements

### Medium Priority

- [ ] New CLI features
- [ ] Account management improvements
- [ ] Config file enhancements
- [ ] Performance optimizations

### Low Priority (Ideas)

- [ ] UI for account management
- [ ] Keychain integration
- [ ] Usage analytics
- [ ] Web dashboard

See the README.md [Future Ideas](README.md#-future-ideas) section for more.

## 📚 Architecture Overview

For development, understand these key components:

### Provider System
- **File**: `src/provider.ts`
- **Role**: Intercepts requests and routes to correct account
- **Key**: Token refresh logic

### Account Pool
- **File**: `src/storage/pool.ts`
- **Role**: Stores accounts persistently
- **Key**: Singleton pattern, lazy loading

### CLI Tool
- **File**: `src/commands/multi-copilot.ts`
- **Role**: Command-line interface
- **Commands**: list, add, remove, clear, install

### Account Discovery
- **File**: `src/discovery/accounts.ts`
- **Role**: Detects and syncs accounts from OpenCode auth
- **Key**: GitHub API calls for username

### Config Writer
- **File**: `src/config/writer.ts`
- **Role**: Updates opencode.json with models
- **Key**: Preserves existing config

## 🔧 Build Commands

```bash
# Build TypeScript to JavaScript
npm run build

# Watch mode - rebuild on file changes
npm run watch

# Clean build artifacts
npm run clean

# Check for TypeScript errors (without building)
npx tsc --noEmit

# Show TypeScript diagnostics
npx tsc --diagnostics
```

## 📦 Publishing Process

Only maintainers can publish, but here's how:

```bash
# 1. Update version
npm version patch  # or minor/major

# 2. Build
npm run build

# 3. Publish (requires npm credentials)
npm publish

# 4. Create GitHub release
# Go to https://github.com/iamvaleriofantozzi/opencode-copilot-multi/releases
# Create release notes
```

## 📋 Pull Request Checklist

Before submitting a PR:

- [ ] Code follows style guidelines
- [ ] Changes are well-commented
- [ ] Conventional commit message used
- [ ] No `console.log` statements (use logger)
- [ ] No breaking changes (or documented)
- [ ] README updated if needed
- [ ] Works locally

## 🙏 Thank You!

Your contributions help make this project better for everyone. We appreciate:

- Bug reports
- Feature suggestions
- Code contributions
- Documentation improvements
- Feedback and ideas

## ❓ Questions?

- Open a discussion: [GitHub Discussions](https://github.com/iamvaleriofantozzi/opencode-copilot-multi/discussions)
- Create an issue: [GitHub Issues](https://github.com/iamvaleriofantozzi/opencode-copilot-multi/issues)
- Check logs: `~/.local/share/opencode/log/copilot-multi.log`

---

**Happy Contributing! 🎉**
