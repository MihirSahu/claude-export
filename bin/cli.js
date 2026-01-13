#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import { exportConversations, VERSION } from '../src/index.js';

const program = new Command();

program
  .name('claude-export')
  .description('Export Claude conversations from conversations.json to Markdown files')
  .version(VERSION)
  .requiredOption('-i, --input <path>', 'Path to conversations.json file')
  .option('-o, --output <dir>', 'Output directory', './claude-export-output')
  .action(async (options) => {
    const inputPath = path.resolve(options.input);
    const outputDir = path.resolve(options.output);

    console.log(`\nClaude Export v${VERSION}`);
    console.log('─'.repeat(40));
    console.log(`Input:  ${inputPath}`);
    console.log(`Output: ${outputDir}`);
    console.log('─'.repeat(40));
    console.log('');

    try {
      const results = await exportConversations(inputPath, outputDir);

      console.log('');
      console.log('─'.repeat(40));
      console.log(`✓ Exported: ${results.success} conversations`);
      if (results.failed > 0) {
        console.log(`✗ Failed:   ${results.failed} conversations`);
      }
      console.log(`Output:    ${outputDir}`);
    } catch (err) {
      console.error(`\nError: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
