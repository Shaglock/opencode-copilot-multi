# opencode-copilot-multi

OpenCode plugin for using **multiple GitHub Copilot accounts** simultaneously.

## Features

- 🔄 **Multi-account support**: Use multiple GitHub Copilot accounts in the same OpenCode session
- 🎯 **Per-model account selection**: Each model shows which account it belongs to
- 🔒 **Secure**: Credentials stored locally with proper permissions
- ⚡ **Non-blocking**: Lazy loading, doesn't slow down OpenCode startup
- 🔄 **Auto-sync**: Automatically detects new accounts when you authenticate

## Installation

### Quick Install (Recommended)

```bash
# Install the plugin in OpenCode
npx opencode-copilot-multi@latest install

# Restart OpenCode to load the plugin
```

### Manual Installation

Add to your `~/.config/opencode/opencode.json`:

```json
{
  "plugin": ["opencode-copilot-multi"]
}
```

Then restart OpenCode.

## Usage

### 1. Add GitHub Copilot Accounts

For each account you want to use:

```bash
opencode-copilot-multi add
# or with npx:
npx opencode-copilot-multi@latest add
```

This will:
1. Launch `opencode auth login`
2. Let you select "GitHub Copilot" and authenticate
3. Automatically detect and add the account to the pool
4. Update your OpenCode config with the new models

### 2. Select Models in OpenCode

Open the model selector in OpenCode and you'll see models prefixed with account names:

```
copilot-multi/username1:claude-sonnet-4
copilot-multi/username1:gpt-5
copilot-multi/username2:claude-opus-4
```

### 3. Switch Between Accounts

Simply select a different model - the plugin handles authentication automatically.

## CLI Commands

```bash
# Install plugin in OpenCode config
opencode-copilot-multi install

# List all configured accounts
opencode-copilot-multi list

# Add a new account
opencode-copilot-multi add

# Remove a specific account
opencode-copilot-multi remove <username>

# Clear all accounts
opencode-copilot-multi clear

# Show help
opencode-copilot-multi --help
```

## How It Works

1. **Account Pool**: Accounts are stored in `~/.local/share/opencode/copilot-multi-accounts.json`
2. **Model Format**: Models appear as `username:model-id` under provider `copilot-multi`
3. **Routing**: When you select a model, the plugin extracts the username and uses that account's credentials
4. **Token Refresh**: Tokens are automatically refreshed when they expire

## Configuration

The plugin automatically writes model configurations to your `opencode.json`:

```json
{
  "provider": {
    "copilot-multi": {
      "models": {
        "username:claude-sonnet-4": {
          "name": "username: Claude Sonnet 4",
          "limit": { "context": 200000, "output": 64000 }
        }
      }
    }
  }
}
```

## Troubleshooting

### No models appearing

1. Make sure you've added an account: `opencode-copilot-multi add`
2. Check the log file: `~/.local/share/opencode/log/copilot-multi.log`
3. Verify the pool file exists: `~/.local/share/opencode/copilot-multi-accounts.json`
4. Restart OpenCode

### Token refresh errors

If you see token refresh errors, try re-authenticating:

```bash
opencode-copilot-multi add
# Select "GitHub Copilot" and complete authentication
```

### Plugin not loading

1. Verify plugin is installed: Check `~/.config/opencode/opencode.json` contains `"opencode-copilot-multi"`
2. Reinstall: `npx opencode-copilot-multi@latest install`
3. Restart OpenCode

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch
```

## License

MIT
