#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { convertMarkdownToGutenberg } from './converter';
import { runMcpServer } from './mcp-server';

const program = new Command();

program
  .name('markwp')
  .description('Convert Markdown to WordPress Gutenberg blocks format')
  .version('1.0.0')
  .option('--mcp', 'Run as MCP server')
  .argument('[input]', 'Input Markdown text or file path')
  .argument('[output]', 'Output file path (optional, defaults to stdout)')
  .option('-f, --file', 'Treat input as file path instead of text')
  .option('-d, --debug', 'Enable debug mode')
  .option('-p, --pretty', 'Pretty print output')
  .action(async (input, output, options) => {
    if (options.mcp) {
      await runMcpServer();
      return;
    }

    if (!input) {
      program.help();
      return;
    }
    try {
      let markdownContent: string;
      
      if (options.file) {
        // Treat input as file path
        markdownContent = readFileSync(input, 'utf8');
      } else {
        // Treat input as text directly
        markdownContent = input;
      }
      
      const gutenbergOutput = convertMarkdownToGutenberg(markdownContent, {
        pretty: options.pretty,
        debug: options.debug
      });
      
      if (output) {
        // Output to file
        const outputPath = resolve(output);
        writeFileSync(outputPath, gutenbergOutput, 'utf-8');
        if (options.debug) {
          console.error(`Output written to: ${outputPath}`);
        }
      } else {
        // Output to stdout
        console.log(gutenbergOutput);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();