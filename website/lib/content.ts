export type PreviewViewId = "source" | "archive" | "markdown";

export type PreviewView = {
  id: PreviewViewId;
  label: string;
  panelLabel: string;
  kind: "code" | "archive" | "paper";
  code?: string;
  slipTitle?: string;
  slipList?: string[];
  treeLines?: string[];
};

export const pageCopy = {
  description:
    "claude-export turns Claude's conversations.json export into dated transcript files with frontmatter, timestamps, and tool calls preserved for notes, repos, and knowledge bases.",
  previewCaption:
    "Preview the raw JSON, the dated archive layout, and the Markdown transcript written to disk.",
  footer: "for Claude work that ends up in notes, repos, and knowledge bases"
} as const;

export const cliSplash = {
  art: [" ▐▛███▜▌", "▝▜█████▛▘", "  ▘▘ ▝▝"],
  lines: [
    "claude-export v1.0.0",
    "Markdown archive · conversations.json",
    "dated folders · tool calls"
  ]
} as const;

export const previewViews: PreviewView[] = [
  {
    id: "source",
    label: "raw export",
    panelLabel: "conversations.json",
    kind: "code",
    code: `[
  {
    "uuid": "abc123",
    "name": "Debugging importer",
    "created_at": "2025-03-21T04:28:07.483Z",
    "updated_at": "2025-03-21T04:29:35.410Z",
    "chat_messages": [
      { "sender": "human", "text": "Why did this fail?" },
      { "sender": "assistant", "content": [ ... ] }
    ]
  }
]`
  },
  {
    id: "archive",
    label: "archive",
    panelLabel: "export drawer",
    kind: "archive",
    treeLines: [
      "claude-export-output/",
      "Conversation Index.md",
      "2025/",
      "03/",
      "2025-03-21/",
      "Debugging importer.md",
      "Release checklist.md"
    ],
    slipTitle: "Conversation Index.md",
    slipList: [
      "March 2025",
      "March 21, 2025",
      "Debugging importer",
      "Release checklist"
    ]
  },
  {
    id: "markdown",
    label: "transcript",
    panelLabel: "markdown transcript",
    kind: "paper",
    code: `---
claude_export_version: 1.0.0
claude_conversation_id: abc123
claude_conversation_title: Debugging importer
claude_create_time: '2025-03-21T04:28:07.483Z'
claude_update_time: '2025-03-21T04:29:35.410Z'
claude_message_count: 2
tags: claude_conversation
---

*Chat started March 21, 2025, 4:28:07 AM UTC*

---

# 1. Human
*March 21, 2025, 4:28:08 AM UTC*

> Why did this fail?`
  }
];

export const installCommands = [
  {
    label: "run once",
    value: "npx claude-export -i conversations.json",
    ariaLabel: "Copy npx command"
  },
  {
    label: "install globally",
    value: "npm install -g claude-export",
    ariaLabel: "Copy npm install command"
  }
] as const;

export const usageBlock = `claude-export -i <path-to-conversations.json>
  [-o <output-directory>]`;

export const optionsList = [
  {
    flag: "-i, --input",
    description: "Path to the Claude conversations.json export."
  },
  {
    flag: "-o, --output",
    description: "Directory where the Markdown archive is written."
  }
] as const;
