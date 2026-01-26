# opencode-copilot-multi

[![npm version](https://img.shields.io/npm/v/opencode-copilot-multi.svg)](https://www.npmjs.com/package/opencode-copilot-multi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

An **OpenCode plugin** that enables seamless switching between multiple GitHub Copilot accounts within a single OpenCode session.

## 🚀 Overview

Tired of managing multiple OpenCode windows for different GitHub Copilot accounts? This plugin lets you:

- **Use multiple accounts simultaneously** - Switch between GitHub Copilot accounts without restarting OpenCode
- **See account-specific models** - Each model is labeled with its account username for clarity
- **Automatic authentication** - Tokens refresh automatically, seamlessly in the background
- **Non-invasive** - Lazy-loads after startup, zero performance impact
- **Secure by default** - Credentials stored locally with proper file permissions

**Perfect for**: Developers with personal + work accounts, teams sharing one workstation, or testing with multiple GitHub Copilot subscriptions.

## ✨ Key Features

| Feature | Details |
|---------|---------|
| 🔄 **Multi-account support** | Use 2, 3, or more GitHub Copilot accounts simultaneously |
| 🎯 **Per-account models** | Models appear as `username:model-name` for easy identification |
| 🔒 **Secure storage** | OAuth tokens stored locally with 0600 file permissions |
| ⚡ **Non-blocking init** | Lazy loads on first request, no OpenCode startup delay |
| 🔄 **Auto token refresh** | Tokens refreshed 5 minutes before expiry (transparent to user) |
| 📱 **Cross-platform** | Works on macOS, Linux, and Windows |

## 📋 Supported Models

Access 15+ models through GitHub Copilot including:

**Claude Family**
- Claude Opus 4 / 4.5
- Claude Sonnet 4 / 4.5  
- Claude Haiku 4.5

**OpenAI Family**
- GPT-5 (latest)
- GPT-4o / GPT-4o Mini
- GPT-4 Turbo
- o1 / o1-mini / o3-mini

**Google Gemini Family**
- Gemini 2.5 Pro
- Gemini 3 Pro / Flash (preview)

New models are automatically detected and added when you authenticate with a GitHub Copilot account.

## ⚙️ System Requirements

- **Node.js**: ≥ 18.0.0
- **OpenCode**: Latest version with plugin support
- **GitHub Copilot**: Active subscription on GitHub account

## 🔧 Installation

### Option 1: Global Installation (Recommended)

Install globally for system-wide access:

```bash
npm install -g opencode-copilot-multi
```

This automatically:
- ✅ Registers the plugin in OpenCode config
- ✅ Makes the CLI available globally  
- ✅ Runs post-install setup

Then restart OpenCode to load the plugin.

### Option 2: Using NPX (No Global Install)

Run commands via npx without installing globally:

```bash
npx opencode-copilot-multi@latest add
npx opencode-copilot-multi@latest list
```

### Option 3: Manual Registration

If automatic setup fails:

```bash
# Step 1: Run the install command manually
opencode-copilot-multi install

# Step 2: Restart OpenCode
```

This registers the plugin in `~/.config/opencode/opencode.json`.

## 🎯 Quick Start

### 1️⃣ Add Your First Account

```bash
opencode-copilot-multi add
```

This will:
- Launch `opencode auth login`
- Prompt you to select **"GitHub Copilot"**
- Complete OAuth flow
- Automatically add the account to the pool
- Update OpenCode config with available models

### 2️⃣ Restart OpenCode

The models for your account are now available in the model selector.

### 3️⃣ Select a Model

Open OpenCode's model selector and look for models like:

```
copilot-multi/your-username:claude-sonnet-4
copilot-multi/your-username:gpt-4o
copilot-multi/other-username:o1
```

### 4️⃣ Add More Accounts (Optional)

```bash
opencode-copilot-multi add
```

Simply run `add` again for each additional account. Each account's models appear with its username as a prefix.

## 🛠️ CLI Commands

All commands work both globally and via npx:

```bash
# Global usage (if installed with -g)
opencode-copilot-multi <command>

# Via npx (no global install needed)
npx opencode-copilot-multi@latest <command>
```

### Available Commands

#### `list` / `ls`
Show all configured accounts and their models:

```bash
opencode-copilot-multi list
```

**Output:**
```
👥 GitHub Copilot Accounts (2)

┌─────┬────────────────────┬─────────┬───────────────┐
│ #   │ Username           │ Models  │ Added         │
├─────┼────────────────────┼─────────┼───────────────┤
│ 1   │ john-dev           │      15 │ Jan 26, 2026  │
│ 2   │ jane-work          │      15 │ Jan 25, 2026  │
└─────┴────────────────────┴─────────┴───────────────┘
```

#### `add`
Authenticate with GitHub Copilot and add a new account:

```bash
opencode-copilot-multi add
```

Steps:
1. Launches `opencode auth login`
2. Select **"GitHub Copilot"** from options
3. Complete OAuth authentication in browser
4. Returns to terminal (auto-detects account)
5. Models added to OpenCode config

#### `remove <username>`
Remove a specific account and its models:

```bash
opencode-copilot-multi remove john-dev
```

### `clear` / `clear --force`
Remove all accounts at once:

```bash
# With confirmation prompt
opencode-copilot-multi clear

# Force without confirmation
opencode-copilot-multi clear --force
```

#### `install`
Manually register plugin in OpenCode (rarely needed):

```bash
opencode-copilot-multi install
```

> **Note:** This command is automatically run during `npm install -g`. Only use it if automatic setup failed.

#### `--help` / `-h`
Show all available commands and usage:

```bash
opencode-copilot-multi --help
```

## 🏗️ How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  User selects model in OpenCode                     │
│  Example: "john-dev:claude-sonnet-4"               │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Custom Provider Loader                             │
│  - Parses model ID                                  │
│  - Extracts username + real model name             │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Account Pool Lookup                                │
│  ~/.local/share/opencode/                          │
│    copilot-multi-accounts.json                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Token Refresh Check                                │
│  - Is token valid?                                  │
│  - Auto-refresh if needed (5 min buffer)           │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Route to GitHub Copilot API                        │
│  - Add account's access token                       │
│  - Replace model ID with real model                │
│  - Add Copilot headers                              │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Response returned to OpenCode                      │
└─────────────────────────────────────────────────────┘
```

### Key Components

#### Plugin Entry Point (`src/index.ts`)
- Registers custom provider with OpenCode
- Sets up account pool management
- Implements lazy loading (non-blocking)
- Handles account sync on session creation

#### Custom Provider (`src/provider.ts`)
- Routes requests to correct account based on model ID
- Manages token refresh automatically
- Prevents concurrent token refresh (mutex pattern)
- Logs all requests for debugging

#### Account Pool (`src/storage/pool.ts`)
- Stores accounts in: `~/.local/share/opencode/copilot-multi-accounts.json`
- Lazy-loaded singleton pattern
- File permissions: 0600 (only owner can read)
- Automatic backup of corrupted files

#### Account Discovery (`src/discovery/accounts.ts`)
- Reads GitHub Copilot auth from OpenCode's `auth.json`
- Extracts GitHub username via API
- Detects available models
- Auto-syncs on every session creation

#### Configuration Writer (`src/config/writer.ts`)
- Updates `~/.config/opencode/opencode.json` / `.jsonc`
- Adds models in format: `copilot-multi/username:model-id`
- Configures model limits, modalities, and display names
- Preserves existing config (non-destructive merge)

## 📁 Data Storage

### Account Pool
**Location**: `~/.local/share/opencode/copilot-multi-accounts.json`

**Structure**:
```json
{
  "version": 1,
  "accounts": [
    {
      "id": "abc123...",
      "username": "john-dev",
      "displayName": "john-dev",
      "auth": {
        "type": "oauth",
        "access": "ghu_...",
        "refresh": "ghr_...",
        "expires": 1704067200000
      },
      "models": [
        "claude-sonnet-4",
        "gpt-4o",
        ...
      ],
      "addedAt": 1704067200000,
      "lastUsed": 1704067200000
    }
  ],
  "lastUpdated": 1704067200000
}
```

**Permissions**: `0600` (owner read/write only)

### OpenCode Config Updates
**Location**: `~/.config/opencode/opencode.json` or `.jsonc`

**Added by plugin**:
```json
{
  "plugin": ["opencode-copilot-multi"],
  "provider": {
    "copilot-multi": {
      "models": {
        "john-dev:claude-sonnet-4": {
          "name": "john-dev: Claude Sonnet 4",
          "limit": {
            "context": 200000,
            "output": 64000
          },
          "modalities": {
            "input": ["text", "image"],
            "output": ["text"]
          }
        },
        "john-dev:gpt-4o": {
          "name": "john-dev: GPT-4o",
          "limit": {
            "context": 128000,
            "output": 16000
          },
          "modalities": {
            "input": ["text", "image"],
            "output": ["text"]
          }
        }
      }
    }
  }
}
```

## 🔐 Security

### Token Management
- **Storage**: Encrypted in `copilot-multi-accounts.json` (file permissions 0600)
- **Refresh**: Automatic, 5 minutes before expiry
- **Expiry**: gho_* tokens never expire, others auto-refreshed
- **No caching**: Fresh token on every request

### File Permissions
```bash
# Pool file: readable only by owner
-rw------- user staff copilot-multi-accounts.json

# Config file: standard permissions
-rw-r--r-- user staff opencode.json
```

### OAuth Flow
- Uses GitHub OAuth standard flow
- VS Code client ID for compatibility
- Refresh tokens used to get new access tokens
- No passwords stored

## 🐛 Troubleshooting

### Problem: "No models appearing in model selector"

**Check 1: Account added?**
```bash
opencode-copilot-multi list
```

If empty, run:
```bash
opencode-copilot-multi add
```

**Check 2: Config written?**
```bash
cat ~/.config/opencode/opencode.json | grep copilot-multi
```

Should show the plugin and models.

**Check 3: OpenCode restarted?**
Models only appear after restart. Close and reopen OpenCode.

**Check 4: Logs?**
```bash
tail -f ~/.local/share/opencode/log/copilot-multi.log
```

### Problem: "Permission denied when adding account"

This usually means OpenCode's auth wasn't found.

**Solution:**
1. Run `opencode auth login` manually
2. Select **"GitHub Copilot"** (important!)
3. Complete OAuth flow
4. Then run: `opencode-copilot-multi add`

### Problem: "Token refresh failed"

This means your GitHub Copilot subscription might have expired or the token was revoked.

**Solution:**
```bash
# Re-authenticate the account
opencode-copilot-multi add

# Or remove and re-add
opencode-copilot-multi remove <username>
opencode-copilot-multi add
```

### Problem: "Invalid pool file / pool corrupted"

The plugin automatically backs up corrupted files:

```bash
# Backup created at (when corruption detected):
~/.local/share/opencode/copilot-multi-accounts.json.backup.TIMESTAMP

# The pool is reset to empty, you can:
opencode-copilot-multi add  # Re-add accounts
```

### Problem: "Plugin not loading after installation"

**Check these in order:**

1. **Verify installation**:
   ```bash
   npm list -g opencode-copilot-multi
   ```

2. **Run install command**:
   ```bash
   opencode-copilot-multi install
   ```

3. **Check config**:
   ```bash
   cat ~/.config/opencode/opencode.json | grep opencode-copilot-multi
   ```

4. **Restart OpenCode** (fully close and reopen)

5. **Check logs**:
   ```bash
   tail -f ~/.local/share/opencode/log/copilot-multi.log
   ```

## 🧪 Development

### Setup

```bash
# Clone the repository
git clone https://github.com/iamvaleriofantozzi/opencode-copilot-multi.git
cd opencode-copilot-multi

# Install dependencies
npm install

# Build (TypeScript → JavaScript)
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch
```

### Project Structure

```
src/
├── index.ts                 # Plugin entry point
├── provider.ts              # Custom provider with fetch routing
├── types.ts                 # TypeScript definitions
├── commands/
│   └── multi-copilot.ts     # CLI command handlers
├── config/
│   └── writer.ts            # Config file management
├── discovery/
│   ├── accounts.ts          # Account detection & sync
│   ├── models.ts            # Model definitions & config
│   └── username.ts          # GitHub API calls
├── storage/
│   ├── pool.ts              # Account pool persistence
│   └── auth.ts              # OpenCode auth.json reading
└── utils/
    ├── logger.ts            # Logging system
    ├── errors.ts            # Custom error classes
    └── jsonc.ts             # JSON with comments parser

bin/
└── cli.ts                   # CLI entrypoint

scripts/
└── postinstall.js           # Runs after npm install
```

### Build Output

```
dist/                        # Compiled JavaScript + source maps
├── index.js / .js.map
├── provider.js / .js.map
├── commands/
├── config/
├── discovery/
├── storage/
└── utils/

bin/cli.js                   # Compiled CLI
```

### Testing Workflow

1. **Build**: `npm run build`
2. **Link globally**: `npm link`
3. **Test command**: `opencode-copilot-multi list`
4. **Unlink**: `npm unlink -g`

### Common Development Tasks

```bash
# Clean build artifacts
npm run clean

# Build everything
npm run build

# Watch and rebuild on file changes
npm run watch

# Test TypeScript compilation
npx tsc --noEmit

# Check for type errors
npx tsc --diagnostics
```

## 📦 Publishing

```bash
# Update version in package.json
npm version patch  # or minor/major

# Build
npm run build

# Publish to npm
npm publish
```

The `prepublishOnly` script automatically builds before publishing.

## 📄 License

MIT © 2025 Valerio Fantozzi

See [LICENSE](LICENSE) for full text.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 💡 Future Ideas

- [ ] Manage account settings per GitHub user (display name, model preferences)
- [ ] Automatic account discovery without manual `opencode auth login`
- [ ] Account switching via keyboard shortcuts
- [ ] Per-project default account configuration
- [ ] Token encryption with system keychain
- [ ] Web UI for account management
- [ ] Rate limiting per account
- [ ] Usage analytics

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/iamvaleriofantozzi/opencode-copilot-multi/issues)
- **Discussions**: [GitHub Discussions](https://github.com/iamvaleriofantozzi/opencode-copilot-multi/discussions)
- **Logs**: `~/.local/share/opencode/log/copilot-multi.log`

---

**Made with ❤️ by Valerio Fantozzi**
