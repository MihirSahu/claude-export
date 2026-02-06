import fs from 'fs/promises';
import path from 'path';
import { formatConversation, formatConversationIndex, sanitizeFilename, VERSION } from './formatter.js';

/**
 * Export conversations from a JSON file to markdown files
 * @param {string} inputPath - Path to conversations.json
 * @param {string} outputDir - Output directory path
 * @returns {Promise<{success: number, failed: number, errors: string[]}>}
 */
export async function exportConversations(inputPath, outputDir) {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  // Read and parse input file
  let conversations;
  try {
    const content = await fs.readFile(inputPath, 'utf-8');
    conversations = JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to read or parse input file: ${err.message}`);
  }

  // Ensure it's an array
  if (!Array.isArray(conversations)) {
    throw new Error('Input file must contain an array of conversations');
  }

  // Create output directory
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (err) {
    throw new Error(`Failed to create output directory: ${err.message}`);
  }

  // Track used filenames to avoid collisions
  const usedFilenames = new Set();

  // Track exported entries for the index
  const indexEntries = [];

  // Process each conversation
  for (const conversation of conversations) {
    try {
      // Generate filename
      let baseName = sanitizeFilename(conversation.name || 'Untitled');
      let filename = `${baseName}.md`;
      let counter = 1;

      // Handle filename collisions with upper bound
      const MAX_COLLISION_ATTEMPTS = 10000;
      while (usedFilenames.has(filename.toLowerCase()) && counter < MAX_COLLISION_ATTEMPTS) {
        filename = `${baseName} (${counter}).md`;
        counter++;
      }

      // Fall back to UUID-based naming if collision limit exceeded
      if (usedFilenames.has(filename.toLowerCase())) {
        const uniqueId = conversation.uuid || Date.now();
        filename = `${baseName}-${uniqueId}.md`;
      }
      usedFilenames.add(filename.toLowerCase());

      // Format and write
      const markdown = formatConversation(conversation);
      const outputPath = path.join(outputDir, filename);
      await fs.writeFile(outputPath, markdown, 'utf-8');

      indexEntries.push({
        name: conversation.name || 'Untitled',
        created_at: conversation.created_at,
        filename
      });

      results.success++;
      console.log(`✓ Exported: ${filename}`);
    } catch (err) {
      results.failed++;
      const name = conversation.name || conversation.uuid || 'unknown';
      results.errors.push(`${name}: ${err.message}`);
      console.error(`✗ Failed: ${name} - ${err.message}`);
    }
  }

  // Generate conversation index
  if (indexEntries.length > 0) {
    const indexMarkdown = formatConversationIndex(indexEntries);
    const indexPath = path.join(outputDir, 'Conversation Index.md');
    await fs.writeFile(indexPath, indexMarkdown, 'utf-8');
    console.log(`✓ Generated: Conversation Index.md`);
  }

  return results;
}

export { VERSION };
