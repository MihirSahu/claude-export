import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { version: VERSION } = require('../package.json');

/**
 * Format a date string into a human-readable format
 * @param {string} isoDate - ISO date string
 * @returns {string} Formatted date string
 */
export function formatDate(isoDate) {
  if (!isoDate) return 'Unknown';
  const date = new Date(isoDate);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'UTC',
    timeZoneName: 'short'
  });
}

/**
 * Sanitize a filename by removing/replacing invalid characters
 * @param {string} name - Original filename
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(name) {
  if (!name) return 'untitled';
  return name
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 200);
}

/**
 * Escape a value for safe inclusion in YAML
 * @param {string} value - Value to escape
 * @returns {string} Escaped value safe for YAML
 */
export function escapeYamlValue(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);

  // Check if the value needs quoting
  const needsQuoting = /[:\[\]{},"'|>&*!?#%@`\n\r]/.test(str) ||
    str.startsWith(' ') ||
    str.endsWith(' ') ||
    str === '';

  if (!needsQuoting) return str;

  // Use single quotes and escape internal single quotes by doubling them
  return `'${str.replace(/'/g, "''")}'`;
}

/**
 * Format a tool call as a code block
 * @param {object} toolUse - Tool use content block
 * @returns {string} Formatted tool call
 */
export function formatToolCall(toolUse) {
  const name = toolUse.name || 'unknown_tool';
  const input = toolUse.input || {};
  return `**Tool Call: ${name}**\n\`\`\`json\n${JSON.stringify(input, null, 2)}\n\`\`\``;
}

/**
 * Format message text, handling blockquotes for human messages
 * @param {string} text - Message text
 * @param {string} sender - Message sender (human/assistant)
 * @returns {string} Formatted text
 */
export function formatMessageText(text, sender) {
  if (!text) return '';

  if (sender === 'human') {
    // Wrap human messages in blockquotes
    return text
      .split('\n')
      .map(line => `> ${line}`)
      .join('\n');
  }

  return text;
}

/**
 * Format a single message
 * @param {object} message - Message object
 * @param {number} index - Message index (1-based)
 * @returns {string} Formatted message markdown
 */
export function formatMessage(message, index) {
  const sender = message.sender === 'human' ? 'Human' : 'Assistant';
  const timestamp = formatDate(message.created_at);

  const parts = [];

  // Header with number and sender
  parts.push(`# ${index}.  ${sender}`);
  parts.push(`*${timestamp}*`);
  parts.push('');

  // Process content blocks
  const content = message.content || [];
  const textParts = [];
  const toolCalls = [];

  for (const block of content) {
    if (block.type === 'text' && block.text) {
      textParts.push(block.text);
    } else if (block.type === 'tool_use') {
      toolCalls.push(formatToolCall(block));
    }
  }

  // If no content blocks, fall back to message.text
  if (textParts.length === 0 && message.text) {
    textParts.push(message.text);
  }

  // Add formatted text
  const fullText = textParts.join('\n\n');
  if (fullText) {
    parts.push(formatMessageText(fullText, message.sender));
  }

  // Add tool calls
  if (toolCalls.length > 0) {
    if (fullText) parts.push('');
    parts.push(toolCalls.join('\n\n'));
  }

  return parts.join('\n');
}

/**
 * Generate YAML frontmatter for a conversation
 * @param {object} conversation - Conversation object
 * @returns {string} YAML frontmatter
 */
export function generateFrontmatter(conversation) {
  const now = new Date().toISOString();
  const messageCount = conversation.chat_messages?.length || 0;

  const yaml = [
    '---',
    `claude_export_version: ${VERSION}`,
    `claude_conversation_id: ${escapeYamlValue(conversation.uuid || 'unknown')}`,
    `claude_conversation_title: ${escapeYamlValue(conversation.name || 'Untitled')}`,
    `claude_create_time: ${escapeYamlValue(conversation.created_at || '')}`,
    `claude_update_time: ${escapeYamlValue(conversation.updated_at || '')}`,
    `claude_converted_time: ${escapeYamlValue(now)}`,
    `claude_message_count: ${messageCount}`,
    'tags: claude_conversation',
    '---'
  ];

  return yaml.join('\n');
}

/**
 * Format an entire conversation to markdown
 * @param {object} conversation - Conversation object
 * @returns {string} Complete markdown document
 */
export function formatConversation(conversation) {
  const parts = [];

  // Frontmatter
  parts.push(generateFrontmatter(conversation));

  // Chat started line
  const startDate = formatDate(conversation.created_at);
  parts.push(`*Chat started ${startDate}*`);
  parts.push('');
  parts.push('---');

  // Messages
  const messages = conversation.chat_messages || [];
  messages.forEach((message, index) => {
    parts.push('');
    parts.push(formatMessage(message, index + 1));
    parts.push('');
    parts.push('---');
  });

  // Footer
  parts.push('');
  parts.push(`*Exported by claude-export v${VERSION}*`);
  parts.push('');

  return parts.join('\n');
}

export { VERSION };
