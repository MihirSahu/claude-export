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

  // Track used file paths to avoid collisions
  const usedFilePaths = new Set();

  // Track exported entries for the index
  const indexEntries = [];

  // Process each conversation
  for (const conversation of conversations) {
    try {
      // Build date-based subdirectory: YYYY/MM/YYYY-MM-DD
      const date = new Date(conversation.created_at || 0);
      const year = String(date.getUTCFullYear());
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const subDir = path.join(year, month, `${year}-${month}-${day}`);

      // Generate filename
      let baseName = sanitizeFilename(conversation.name || 'Untitled');
      let filename = `${baseName}.md`;
      let relativePath = path.join(subDir, filename);
      let counter = 1;

      // Handle filename collisions with upper bound
      const MAX_COLLISION_ATTEMPTS = 10000;
      while (usedFilePaths.has(relativePath.toLowerCase()) && counter < MAX_COLLISION_ATTEMPTS) {
        filename = `${baseName} (${counter}).md`;
        relativePath = path.join(subDir, filename);
        counter++;
      }

      // Fall back to UUID-based naming if collision limit exceeded
      if (usedFilePaths.has(relativePath.toLowerCase())) {
        const uniqueId = conversation.uuid || Date.now();
        filename = `${baseName}-${uniqueId}.md`;
        relativePath = path.join(subDir, filename);
      }
      usedFilePaths.add(relativePath.toLowerCase());

      // Create subdirectory and write file
      const fullDir = path.join(outputDir, subDir);
      await fs.mkdir(fullDir, { recursive: true });
      const markdown = formatConversation(conversation);
      await fs.writeFile(path.join(outputDir, relativePath), markdown, 'utf-8');

      indexEntries.push({
        name: conversation.name || 'Untitled',
        created_at: conversation.created_at,
        relativePath
      });

      results.success++;
      console.log(`✓ Exported: ${relativePath}`);
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
