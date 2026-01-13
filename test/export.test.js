import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import {
  formatDate,
  sanitizeFilename,
  escapeYamlValue,
  formatConversation,
  VERSION
} from '../src/formatter.js';
import { exportConversations } from '../src/index.js';

describe('formatDate', () => {
  it('should format a valid ISO date', () => {
    const result = formatDate('2025-03-21T04:28:07.483Z');
    assert.ok(result.includes('March'));
    assert.ok(result.includes('2025'));
    assert.ok(result.includes('UTC'));
  });

  it('should return Unknown for null/undefined', () => {
    assert.strictEqual(formatDate(null), 'Unknown');
    assert.strictEqual(formatDate(undefined), 'Unknown');
    assert.strictEqual(formatDate(''), 'Unknown');
  });
});

describe('sanitizeFilename', () => {
  it('should remove invalid characters', () => {
    assert.strictEqual(sanitizeFilename('test<>:"/\\|?*file'), 'test---------file');
  });

  it('should collapse multiple spaces', () => {
    assert.strictEqual(sanitizeFilename('hello    world'), 'hello world');
  });

  it('should return untitled for empty input', () => {
    assert.strictEqual(sanitizeFilename(''), 'untitled');
    assert.strictEqual(sanitizeFilename(null), 'untitled');
    assert.strictEqual(sanitizeFilename(undefined), 'untitled');
  });

  it('should truncate long names', () => {
    const longName = 'a'.repeat(300);
    assert.strictEqual(sanitizeFilename(longName).length, 200);
  });
});

describe('escapeYamlValue', () => {
  it('should return simple values unchanged', () => {
    assert.strictEqual(escapeYamlValue('hello'), 'hello');
    assert.strictEqual(escapeYamlValue('simple-value'), 'simple-value');
  });

  it('should quote values with colons', () => {
    assert.strictEqual(escapeYamlValue('key: value'), "'key: value'");
  });

  it('should quote values with quotes', () => {
    assert.strictEqual(escapeYamlValue('say "hello"'), "'say \"hello\"'");
  });

  it('should escape single quotes by doubling', () => {
    assert.strictEqual(escapeYamlValue("it's fine"), "'it''s fine'");
  });

  it('should handle null/undefined', () => {
    assert.strictEqual(escapeYamlValue(null), '');
    assert.strictEqual(escapeYamlValue(undefined), '');
  });

  it('should quote values with special YAML characters', () => {
    assert.ok(escapeYamlValue('test#comment').startsWith("'"));
    assert.ok(escapeYamlValue('test&anchor').startsWith("'"));
    assert.ok(escapeYamlValue('test*alias').startsWith("'"));
  });
});

describe('formatConversation', () => {
  it('should produce valid markdown with frontmatter', () => {
    const conversation = {
      uuid: 'test-123',
      name: 'Test Conversation',
      created_at: '2025-03-21T04:28:07.483Z',
      updated_at: '2025-03-21T04:29:35.410Z',
      chat_messages: [
        {
          sender: 'human',
          created_at: '2025-03-21T04:28:08.000Z',
          content: [{ type: 'text', text: 'Hello' }]
        },
        {
          sender: 'assistant',
          created_at: '2025-03-21T04:28:10.000Z',
          content: [{ type: 'text', text: 'Hi there!' }]
        }
      ]
    };

    const result = formatConversation(conversation);

    assert.ok(result.startsWith('---'));
    assert.ok(result.includes('claude_conversation_id: test-123'));
    assert.ok(result.includes('claude_conversation_title: Test Conversation'));
    assert.ok(result.includes('claude_message_count: 2'));
    assert.ok(result.includes('# 1.  Human'));
    assert.ok(result.includes('# 2.  Assistant'));
    assert.ok(result.includes('> Hello'));
    assert.ok(result.includes('Hi there!'));
  });

  it('should escape special characters in title', () => {
    const conversation = {
      uuid: 'test-456',
      name: 'My: "Special" Chat',
      created_at: '2025-03-21T04:28:07.483Z',
      chat_messages: []
    };

    const result = formatConversation(conversation);
    assert.ok(result.includes("claude_conversation_title: 'My: \"Special\" Chat'"));
  });
});

describe('exportConversations', () => {
  it('should export conversations to files', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'claude-export-test-'));
    const inputFile = path.join(tmpDir, 'conversations.json');
    const outputDir = path.join(tmpDir, 'output');

    const conversations = [
      {
        uuid: 'conv-1',
        name: 'First Conversation',
        created_at: '2025-03-21T04:28:07.483Z',
        chat_messages: [
          { sender: 'human', created_at: '2025-03-21T04:28:08.000Z', content: [{ type: 'text', text: 'Test' }] }
        ]
      }
    ];

    await fs.writeFile(inputFile, JSON.stringify(conversations));

    const results = await exportConversations(inputFile, outputDir);

    assert.strictEqual(results.success, 1);
    assert.strictEqual(results.failed, 0);

    const files = await fs.readdir(outputDir);
    assert.strictEqual(files.length, 1);
    assert.strictEqual(files[0], 'First Conversation.md');

    // Cleanup
    await fs.rm(tmpDir, { recursive: true });
  });

  it('should handle filename collisions', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'claude-export-test-'));
    const inputFile = path.join(tmpDir, 'conversations.json');
    const outputDir = path.join(tmpDir, 'output');

    const conversations = [
      { uuid: 'conv-1', name: 'Same Name', created_at: '2025-03-21T04:28:07.483Z', chat_messages: [] },
      { uuid: 'conv-2', name: 'Same Name', created_at: '2025-03-21T04:28:07.483Z', chat_messages: [] },
      { uuid: 'conv-3', name: 'Same Name', created_at: '2025-03-21T04:28:07.483Z', chat_messages: [] }
    ];

    await fs.writeFile(inputFile, JSON.stringify(conversations));

    const results = await exportConversations(inputFile, outputDir);

    assert.strictEqual(results.success, 3);

    const files = await fs.readdir(outputDir);
    assert.strictEqual(files.length, 3);
    assert.ok(files.includes('Same Name.md'));
    assert.ok(files.includes('Same Name (1).md'));
    assert.ok(files.includes('Same Name (2).md'));

    // Cleanup
    await fs.rm(tmpDir, { recursive: true });
  });

  it('should throw on invalid input', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'claude-export-test-'));
    const inputFile = path.join(tmpDir, 'invalid.json');
    const outputDir = path.join(tmpDir, 'output');

    await fs.writeFile(inputFile, '{"not": "an array"}');

    await assert.rejects(
      async () => exportConversations(inputFile, outputDir),
      /Input file must contain an array/
    );

    // Cleanup
    await fs.rm(tmpDir, { recursive: true });
  });
});

describe('VERSION', () => {
  it('should match package.json version', async () => {
    const packageJson = JSON.parse(
      await fs.readFile(new URL('../package.json', import.meta.url), 'utf-8')
    );
    assert.strictEqual(VERSION, packageJson.version);
  });
});
