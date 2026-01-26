# opencode-copilot-multi

[![npm version](https://img.shields.io/npm/v/opencode-copilot-multi.svg)](https://www.npmjs.com/package/opencode-copilot-multi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

OpenCode plugin for seamless switching between **multiple GitHub Copilot accounts** in a single session.

## ✨ Features

- 🔄 **Multi-account support** - Use 2+ GitHub Copilot accounts simultaneously
- 🎯 **Per-model labeling** - Models appear as `username:model-name`
- 🔒 **Secure** - OAuth tokens stored locally with 0600 permissions
- ⚡ **Non-blocking** - Lazy loads, zero impact on OpenCode startup
- 🔄 **Auto token refresh** - 5-minute buffer before expiry
- 📱 **Cross-platform** - macOS, Linux, Windows

## 📋 Supported Models

**Claude**: Opus/Sonnet/Haiku (all versions)  
**OpenAI**: GPT-5, GPT-4o, o1, o3-mini  
**Google**: Gemini 2.5 Pro, Gemini 3

**15+ models** total. New models auto-detected when you authenticate.

## 🔧 Installation

### Option 1: Global (Recommended)
```bash
npm install -g opencode-copilot-multi
# Restart OpenCode
```

### Option 2: Via NPX
```bash
npx opencode-copilot-multi@latest add
```

### Option 3: Manual
Edit `~/.config/opencode/opencode.json`:
```json
{
  "plugin": ["opencode-copilot-multi"]
}
```

## 🎯 Quick Start

1. **Add account**
   ```bash
   opencode-copilot-multi add
   ```
   - Launches OpenCode auth
   - Select "GitHub Copilot"
   - Complete OAuth

2. **Restart OpenCode** - models now appear

3. **Select model** - e.g., `john:claude-sonnet-4`

4. **Add more accounts** - Run `add` again

## 🛠️ CLI Commands

```bash
opencode-copilot-multi list              # Show all accounts
opencode-copilot-multi add               # Add GitHub Copilot account
opencode-copilot-multi remove <username> # Remove account
opencode-copilot-multi clear [--force]   # Remove all accounts
opencode-copilot-multi install           # Register plugin (auto-run)
opencode-copilot-multi --help            # Show help
```

## ⚙️ System Requirements

- **Node.js**: ≥ 18.0.0
- **OpenCode**: Latest version
- **GitHub Copilot**: Active subscription

## 🐛 Troubleshooting

### No models appearing
1. Run: `opencode-copilot-multi list`
2. If empty, run: `opencode-copilot-multi add`
3. Restart OpenCode
4. Check logs: `tail ~/.local/share/opencode/log/copilot-multi.log`

### Token refresh errors
Re-authenticate:
```bash
opencode-copilot-multi remove <username>
opencode-copilot-multi add
```

### Plugin not loading
```bash
opencode-copilot-multi install
# Restart OpenCode
```

## 📚 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design, diagrams, patterns
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute
- **[SECURITY.md](SECURITY.md)** - Token security, vulnerability process
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

## 🏗️ How It Works

When you select `john:claude-sonnet-4`:

1. **Parser** extracts username + model
2. **Pool lookup** finds account by username
3. **Token check** refreshes if expiring
4. **API call** routes to GitHub Copilot with account's token
5. **Response** returned to OpenCode

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed flow diagrams.

## 🔐 Security

- **Storage**: `~/.local/share/opencode/copilot-multi-accounts.json` (0600)
- **Tokens**: OAuth only, no passwords
- **Refresh**: Auto 5 minutes before expiry
- **No telemetry**: Offline by design

See [SECURITY.md](SECURITY.md) for complete details.

## 🧪 Development

```bash
npm install
npm run build           # Compile TypeScript
npm run watch          # Watch & rebuild
npm link               # Link globally for testing
```

**Project structure**:
```
src/
├── index.ts            # Plugin entry
├── provider.ts         # Custom fetch handler
├── storage/            # Account pool & auth
├── discovery/          # Account detection
├── config/             # Config management
├── commands/           # CLI commands
└── utils/              # Helpers
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow.

## 📄 License

MIT © 2025 Valerio Fantozzi

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code style guidelines
- Development setup
- PR process
- Areas for contribution

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/iamvaleriofantozzi/opencode-copilot-multi/issues)
- **Discussions**: [GitHub Discussions](https://github.com/iamvaleriofantozzi/opencode-copilot-multi/discussions)
- **Security**: See [SECURITY.md](SECURITY.md)

---

**Made with ❤️ by Valerio Fantozzi**
