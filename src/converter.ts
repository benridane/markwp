import MarkdownIt from 'markdown-it';
import { MarkdownParser } from './parser/markdown-parser';
import { BlockParser } from './parser/block-parser';

export interface ConvertOptions {
  pretty?: boolean;
  debug?: boolean;
}

export function convertMarkdownToGutenberg(markdown: string, options: ConvertOptions = {}): string {
  const blockParser = new BlockParser();
  const markdownParser = new MarkdownParser(options);
  
  if (options.debug) {
    console.error('Starting Markdown to Gutenberg conversion...');
  }

  // First, process all custom block syntax
  let processedContent = blockParser.parseBlocks(markdown);
  
  // Handle button syntax
  processedContent = processedContent.replace(/\[([^\]]+)\]\(([^)]+)\)\{\.wp-block-button\}/g, (match, text, href) => {
    return `<!-- wp:buttons -->
<div class="wp-block-buttons">
<div class="wp-block-button">
<a class="wp-block-button__link" href="${href}">${text}</a>
</div>
</div>
<!-- /wp:buttons -->`;
  });
  
  // Process markdown content while preserving Gutenberg blocks
  const lines = processedContent.split('\n');
  const processedLines: string[] = [];
  let insideGutenbergBlock = false;
  let gutenbergBlockContent: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.trim().startsWith('<!-- wp:')) {
      // Start of a Gutenberg block
      insideGutenbergBlock = true;
      processedLines.push(line);
      
      // Check if it's a self-closing block comment on the same line
      if (line.includes('<!-- /wp:')) {
        insideGutenbergBlock = false;
      }
    } else if (line.trim().startsWith('<!-- /wp:')) {
      // End of a Gutenberg block
      insideGutenbergBlock = false;
      processedLines.push(line);
    } else if (insideGutenbergBlock) {
      // Inside a Gutenberg block, keep as is
      processedLines.push(line);
    } else {
      // Outside Gutenberg blocks, process markdown
      if (line.trim()) {
        // Look ahead to see if we should combine lines into a single block
        let contentBlock = line;
        let j = i + 1;
        
        // Collect consecutive non-block lines
        while (j < lines.length && lines[j].trim() && !lines[j].trim().startsWith('<!-- wp:') && !lines[j].trim().startsWith('## ')) {
          contentBlock += '\n' + lines[j];
          j++;
        }
        
        if (j > i + 1) {
          // Process the collected block
          const processed = markdownParser.parse(contentBlock);
          processedLines.push(processed);
          i = j - 1; // Skip the lines we just processed
        } else {
          // Single line
          const processed = markdownParser.parse(line);
          processedLines.push(processed);
        }
      } else {
        processedLines.push(line);
      }
    }
  }
  
  let result = processedLines.join('\n');
  
  // Clean up excessive empty lines (more than 2 consecutive)
  result = result.replace(/\n{3,}/g, '\n\n');
  
  if (options.debug) {
    console.error('Conversion complete');
  }

  return result.trim();
}