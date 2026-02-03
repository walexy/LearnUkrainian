# Learn Ukrainian MCP Server

Connect your Ukrainian learning progress to Claude Desktop for personalized AI tutoring.

## Quick Setup (No Account Needed)

### 1. Configure Claude Desktop

Open your Claude Desktop config file:
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "learn-ukrainian": {
      "command": "npx",
      "args": ["-y", "learn-ukrainian-mcp"]
    }
  }
}
```

### 2. Export Your Progress

1. Go to [learn-ukrainian.netlify.app](https://learn-ukrainian.netlify.app)
2. Open **Dashboard** → **Settings** → **Connect to Claude Desktop**
3. Click **Export Progress** to download `progress.json`
4. Save it to `~/.language-learner/progress.json`

On Mac/Linux:
```bash
mkdir -p ~/.language-learner
mv ~/Downloads/progress.json ~/.language-learner/
```

### 3. Restart Claude Desktop

That's it! Now you can ask Claude things like:
- "What should I practice in Ukrainian today?"
- "Help me with my struggling letters"
- "Quiz me on Cyrillic"

### 4. Keep Progress Updated

Re-export your progress whenever you want Claude to see your latest learning data.

---

## What It Does

The MCP server gives Claude access to:

- **Your Profile**: Letters mastered, listening hours, streak
- **Weak Areas**: Letters you struggle with, comprehension gaps
- **Vocabulary**: Words you've encountered and their frequency

Claude uses this to personalize tutoring sessions based on your actual progress.

---

## How It Works

```
Browser (learn-ukrainian.netlify.app)
    ↓ Export progress.json
~/.language-learner/progress.json
    ↓ MCP server reads file
Claude Desktop
    ↓ Personalized tutoring
You!
```

The MCP server reads your exported progress file locally. No accounts, no cloud sync required.

---

## Advanced: Cloud Sync

For automatic sync without manual exports, you can set up cloud sync:

1. Create an account at learn-ukrainian.netlify.app
2. Get your auth token from Dashboard → Settings
3. Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "learn-ukrainian": {
      "command": "npx",
      "args": ["-y", "learn-ukrainian-mcp"],
      "env": {
        "LANGUAGE_LEARNER_AUTH_TOKEN": "your-token-here"
      }
    }
  }
}
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LANGUAGE_LEARNER_DATA_PATH` | Path to progress.json | `~/.language-learner/progress.json` |
| `LANGUAGE_LEARNER_AUTH_TOKEN` | Auth token for cloud sync | - |
| `LANGUAGE_LEARNER_API_URL` | API endpoint | `https://learn-ukrainian.netlify.app` |
| `LANGUAGE_LEARNER_LANGUAGE` | Language code | `uk` |

---

## Troubleshooting

**"No progress data found"**
- Make sure you've exported progress.json from the app
- Check the file exists at `~/.language-learner/progress.json`

**Claude doesn't see my latest progress**
- Re-export progress.json from the Dashboard
- Restart Claude Desktop

**Permission errors**
- Ensure the `~/.language-learner` directory is readable

---

## Privacy

- Your learning data stays on your computer (in progress.json)
- The MCP server only reads data, it doesn't modify anything
- No data is sent anywhere unless you enable cloud sync
