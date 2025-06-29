export interface BlockDefinition {
  name: string;
  attributes?: Record<string, any>;
  content: string;
}

export class BlockParser {
  parseBlocks(markdown: string): string {
    // Handle nested blocks by processing from innermost to outermost
    let result = markdown;
    let processed = true;
    const maxIterations = 10; // Prevent infinite loops
    let iterations = 0;
    
    while (processed && iterations < maxIterations) {
      processed = false;
      iterations++;
      
      // First pass: process blocks without nested ::: patterns
      result = result.replace(/:::([\w-]+)(?:\s*\{([^}]*)\})?\n((?:(?!:::[^\n])[\s\S])*?)\n:::/g, (match, blockName, attributesStr, content) => {
        // Check if this block contains nested blocks (starting with :::)
        if (content.match(/^:::/m)) {
          // Skip this block for now, it has nested blocks
          return match;
        }
        
        processed = true;
        const attributes = this.parseAttributes(attributesStr);
        return this.convertToGutenbergBlock(blockName, attributes, content);
      });
    }
    
    return result;
  }
  
  private parseAttributes(attributesStr: string | undefined): Record<string, any> {
    if (!attributesStr) return {};
    
    const attributes: Record<string, any> = {};
    
    // First, parse key='value' pairs (single quotes for JSON values)
    const kvSinglePattern = /(\w+)='([^']*)'/g;
    let kvMatch;
    while ((kvMatch = kvSinglePattern.exec(attributesStr)) !== null) {
      try {
        // Try to parse as JSON
        attributes[kvMatch[1]] = JSON.parse(kvMatch[2]);
      } catch {
        // If not valid JSON, store as string
        attributes[kvMatch[1]] = kvMatch[2];
      }
    }
    
    // Then parse key="value" pairs (double quotes)
    const kvDoublePattern = /(\w+)="([^"]*)"/g;
    while ((kvMatch = kvDoublePattern.exec(attributesStr)) !== null) {
      attributes[kvMatch[1]] = kvMatch[2];
    }
    
    // Then parse class names (starting with . but not inside quotes)
    // Remove quoted strings first to avoid matching dots inside URLs
    const withoutQuotes = attributesStr.replace(/["'][^"']*["']/g, '');
    const classMatches = withoutQuotes.match(/\.([\w-]+)/g);
    if (classMatches) {
      const classNames = classMatches.map(c => c.substring(1)).join(' ');
      if (attributes.className) {
        attributes.className += ' ' + classNames;
      } else {
        attributes.className = classNames;
      }
    }
    
    return attributes;
  }
  
  private convertToGutenbergBlock(blockName: string, attributes: Record<string, any>, content: string): string {
    const wpBlockName = this.mapToWordPressBlock(blockName);
    const processedContent = this.processBlockContent(wpBlockName, content.trim(), attributes);
    
    return this.wrapGutenbergBlock(wpBlockName, processedContent, attributes);
  }
  
  private mapToWordPressBlock(blockName: string): string {
    const blockMap: Record<string, string> = {
      'columns': 'wp:columns',
      'column': 'wp:column',
      'group': 'wp:group',
      'media-text': 'wp:media-text',
      'cover': 'wp:cover',
      'button': 'wp:buttons',
      'custom-block': 'wp:group' // Fallback for custom blocks
    };
    
    return blockMap[blockName] || `wp:${blockName}`;
  }
  
  private processBlockContent(blockName: string, content: string, attributes: Record<string, any>): string {
    // Process markdown in content first
    const processedContent = this.processMarkdownInContent(content);
    
    switch (blockName) {
      case 'wp:columns':
        return this.processColumnsContent(processedContent);
        
      case 'wp:column':
        return `<div class="wp-block-column">${processedContent}</div>`;
        
      case 'wp:group':
        const className = attributes.className || '';
        return `<div class="wp-block-group${className ? ' ' + className : ''}">${processedContent}</div>`;
        
      case 'wp:media-text':
        return this.processMediaTextContent(processedContent);
        
      case 'wp:cover':
        return this.processCoverContent(processedContent, attributes);
        
      case 'wp:buttons':
        return this.processButtonContent(processedContent);
        
      default:
        return processedContent;
    }
  }
  
  private processColumnsContent(content: string): string {
    // Columns block needs a wrapper div
    return `<div class="wp-block-columns">${content}</div>`;
  }
  
  private processMediaTextContent(content: string): string {
    // Split image and text
    const lines = content.split('\n');
    let imageHtml = '';
    let textHtml = '';
    let foundImage = false;
    
    for (const line of lines) {
      if (line.startsWith('![')) {
        // Extract image
        const imgMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imgMatch) {
          imageHtml = `<figure class="wp-block-media-text__media"><img src="${imgMatch[2]}" alt="${imgMatch[1]}"></figure>`;
          foundImage = true;
        }
      } else if (foundImage && line.trim()) {
        textHtml += line + '\n';
      }
    }
    
    return `<div class="wp-block-media-text">
      ${imageHtml}
      <div class="wp-block-media-text__content">${textHtml.trim()}</div>
    </div>`;
  }
  
  private processCoverContent(content: string, attributes: Record<string, any>): string {
    const bgImage = attributes.background || '';
    const style = bgImage ? ` style="background-image:url(${bgImage})"` : '';
    
    return `<div class="wp-block-cover"${style}>
      <div class="wp-block-cover__inner-container">${content}</div>
    </div>`;
  }
  
  private processButtonContent(content: string): string {
    // Extract link and text
    const linkMatch = content.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      return `<div class="wp-block-buttons">
        <div class="wp-block-button">
          <a class="wp-block-button__link" href="${linkMatch[2]}">${linkMatch[1]}</a>
        </div>
      </div>`;
    }
    return content;
  }
  
  private wrapGutenbergBlock(blockName: string, content: string, attributes: Record<string, any>): string {
    const attrs = { ...attributes };
    
    // Remove attributes that shouldn't be in the comment
    delete attrs.background;
    
    const attrString = Object.keys(attrs).length > 0 ? ' ' + JSON.stringify(attrs) : '';
    
    // Create Gutenberg block with markers to protect from markdown processing
    return `\n<!-- ${blockName}${attrString} -->\n${content}\n<!-- /${blockName} -->\n`;
  }
  
  private processMarkdownInContent(content: string): string {
    // Convert basic markdown elements within block content
    let processed = content;
    
    // Convert headings
    processed = processed.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    processed = processed.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    processed = processed.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    // Convert inline formatting
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert paragraphs (lines that aren't already HTML)
    const lines = processed.split('\n');
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('<') && !trimmed.startsWith('![')) {
        return `<p>${trimmed}</p>`;
      }
      return line;
    });
    
    return processedLines.join('\n').trim();
  }
}