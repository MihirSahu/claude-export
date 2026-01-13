# claude-export

Export Claude conversations from `conversations.json` to individual Markdown files.

## Installation

```bash
npm install -g claude-export
```

Or run directly with npx:

```bash
npx claude-export -i conversations.json
```

## Usage

```bash
claude-export -i <path-to-conversations.json> [-o <output-directory>]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --input <path>` | Path to conversations.json file (required) | - |
| `-o, --output <dir>` | Output directory | `./claude-export-output` |
| `-V, --version` | Output version number | - |
| `-h, --help` | Display help | - |

### Examples

Export to default directory:

```bash
claude-export -i ~/Downloads/conversations.json
```

Export to custom directory:

```bash
claude-export -i conversations.json -o ./my-chats
```

## Output Format

Each conversation is exported as a Markdown file with:

- YAML frontmatter containing metadata
- Numbered message headings
- Timestamps for each message
- Human messages in blockquotes
- Tool calls formatted as code blocks

### Example Output

```markdown
---
claude_export_version: 1.0.0
claude_conversation_id: abc123
claude_conversation_title: My Conversation
claude_create_time: '2025-03-21T04:28:07.483Z'
claude_update_time: '2025-03-21T04:29:35.410Z'
claude_converted_time: '2026-01-12T18:30:00.000Z'
claude_message_count: 2
tags: claude_conversation
---
*Chat started March 21, 2025, 4:28:07 AM UTC*

---

# 1.  Human
*March 21, 2025, 4:28:08 AM UTC*

> Hello, how are you?

---

# 2.  Assistant
*March 21, 2025, 4:28:10 AM UTC*

I'm doing well, thank you for asking!

---

*Exported by claude-export v1.0.0*
```

## License

MIT
