import MarkdownIt from 'markdown-it';

export interface ParserOptions {
  pretty?: boolean;
  debug?: boolean;
}

export class MarkdownParser {
  private md: MarkdownIt;
  private options: ParserOptions;

  constructor(options: ParserOptions = {}) {
    this.options = options;
    this.md = new MarkdownIt({
      html: true,
      xhtmlOut: true,
      breaks: true,
      linkify: true,
      typographer: true
    });
  }

  parse(markdown: string): string {
    const tokens = this.md.parse(markdown, {});
    if (this.options.debug) {
      console.error('Tokens:', JSON.stringify(tokens, null, 2));
    }
    let result = this.renderTokens(tokens);
    
    return result;
  }

  private renderTokens(tokens: any[]): string {
    let result = '';
    let i = 0;
    const imagePlaceholders: any[] = [];
    
    while (i < tokens.length) {
      const token = tokens[i];
      
      // Skip tokens that are part of Gutenberg placeholders
      if (this.isGutenbergPlaceholder(token)) {
        result += token.content;
        i++;
        continue;
      }
      
      switch (token.type) {
        case 'heading_open':
          const level = parseInt(token.tag.substring(1));
          const headingContent = this.getInlineContent(tokens, i + 1, imagePlaceholders);
          result += this.wrapBlock('wp:heading', `<h${level}>${headingContent}</h${level}>`, { level });
          i = this.skipToClosingToken(tokens, i, 'heading_close');
          break;
          
        case 'paragraph_open':
          const paragraphContent = this.getInlineContent(tokens, i + 1, imagePlaceholders);
          if (paragraphContent.includes('<!-- wp:image-placeholder -->')) {
            // If paragraph contains images, render them separately
            const parts = paragraphContent.split('<!-- wp:image-placeholder -->');
            for (let j = 0; j < parts.length; j++) {
              if (parts[j].trim()) {
                result += this.wrapBlock('wp:paragraph', `<p>${parts[j]}</p>`);
              }
              if (j < imagePlaceholders.length) {
                result += imagePlaceholders[j];
              }
            }
            imagePlaceholders.length = 0;
          } else if (paragraphContent.trim()) {
            result += this.wrapBlock('wp:paragraph', `<p>${paragraphContent}</p>`);
          }
          i = this.skipToClosingToken(tokens, i, 'paragraph_close');
          break;
          
        case 'bullet_list_open':
          const bulletListContent = this.getListContent(tokens, i);
          result += this.wrapBlock('wp:list', `<ul>${bulletListContent}</ul>`);
          i = this.skipToClosingToken(tokens, i, 'bullet_list_close');
          break;
          
        case 'ordered_list_open':
          const orderedListContent = this.getListContent(tokens, i);
          result += this.wrapBlock('wp:list', `<ol>${orderedListContent}</ol>`, { ordered: true });
          i = this.skipToClosingToken(tokens, i, 'ordered_list_close');
          break;
          
        case 'blockquote_open':
          const blockquoteContent = this.getBlockquoteContent(tokens, i);
          result += this.wrapBlock('wp:quote', `<blockquote class="wp-block-quote">${blockquoteContent}</blockquote>`);
          i = this.skipToClosingToken(tokens, i, 'blockquote_close');
          break;
          
        case 'code_block':
          const codeContent = this.escapeHtml(token.content);
          result += this.wrapBlock('wp:code', `<pre class="wp-block-code"><code>${codeContent}</code></pre>`);
          break;
          
        case 'fence':
          const fenceContent = this.escapeHtml(token.content);
          const lang = token.info ? ` class="language-${token.info}"` : '';
          result += this.wrapBlock('wp:code', `<pre class="wp-block-code"><code${lang}>${fenceContent}</code></pre>`);
          break;
          
        case 'hr':
          result += this.wrapBlock('wp:separator', '<hr class="wp-block-separator has-alpha-channel-opacity"/>');
          break;
          
        case 'table_open':
          const tableContent = this.getTableContent(tokens, i);
          result += this.wrapBlock('wp:table', `<figure class="wp-block-table"><table>${tableContent}</table></figure>`);
          i = this.skipToClosingToken(tokens, i, 'table_close');
          break;
          
        case 'html_block':
          // Check if this is a Gutenberg block comment
          if (token.content.trim().startsWith('<!-- wp:') || token.content.trim().startsWith('<!-- /wp:')) {
            result += token.content;
          } else if (token.content.includes('[[GUTENBERG:') || token.content.includes('[[/GUTENBERG:')) {
            result += token.content;
          } else {
            // For raw HTML, use custom HTML block
            result += this.wrapBlock('wp:html', token.content);
          }
          break;
      }
      
      i++;
    }
    
    return result;
  }

  private getInlineContent(tokens: any[], startIdx: number, imagePlaceholders?: any[]): string {
    if (startIdx >= tokens.length || tokens[startIdx].type !== 'inline') {
      return '';
    }
    
    return this.renderInline(tokens[startIdx].children, imagePlaceholders);
  }

  private renderInline(tokens: any[], imagePlaceholders?: any[]): string {
    let result = '';
    
    for (const token of tokens) {
      switch (token.type) {
        case 'text':
          result += this.escapeHtml(token.content);
          break;
        case 'softbreak':
          result += '\n';
          break;
        case 'hardbreak':
          result += '<br/>';
          break;
        case 'strong_open':
          result += '<strong>';
          break;
        case 'strong_close':
          result += '</strong>';
          break;
        case 'em_open':
          result += '<em>';
          break;
        case 'em_close':
          result += '</em>';
          break;
        case 'link_open':
          const href = token.attrGet('href');
          result += `<a href="${href}">`;
          break;
        case 'link_close':
          result += '</a>';
          break;
        case 'image':
          const src = token.attrGet('src');
          const alt = token.content;
          const title = token.attrGet('title');
          
          // Extract image ID from filename if possible (e.g., image-123.jpg -> 123)
          const idMatch = src.match(/(?:^|[^\d])(\d+)\.[^.]+$/);
          const attrs: any = { url: src };
          
          if (idMatch) {
            attrs.id = parseInt(idMatch[1]);
          }
          
          // Default size slug
          attrs.sizeSlug = 'large';
          
          if (alt) attrs.alt = alt;
          if (title) attrs.caption = title;
          
          const imgTag = `<img src="${src}" alt="${alt}"${attrs.id ? ` class="wp-image-${attrs.id}"` : ''}${title ? ` title="${title}"` : ''}>`;
          const figureContent = title 
            ? `<figure class="wp-block-image size-${attrs.sizeSlug}">${imgTag}<figcaption>${title}</figcaption></figure>`
            : `<figure class="wp-block-image size-${attrs.sizeSlug}">${imgTag}</figure>`;
          
          const imageBlock = this.wrapBlock('wp:image', figureContent, attrs);
          
          if (imagePlaceholders) {
            imagePlaceholders.push(imageBlock);
            result += `<!-- wp:image-placeholder -->`;
          } else {
            // If not in a paragraph context, render directly
            result += imageBlock;
          }
          break;
        case 'code_inline':
          result += `<code>${this.escapeHtml(token.content)}</code>`;
          break;
      }
    }
    
    return result;
  }

  private getListContent(tokens: any[], startIdx: number): string {
    let result = '';
    let i = startIdx + 1;
    
    while (i < tokens.length && tokens[i].type !== tokens[startIdx].type.replace('_open', '_close')) {
      if (tokens[i].type === 'list_item_open') {
        const itemContent = this.getListItemContent(tokens, i);
        result += `<li>${itemContent}</li>`;
        i = this.skipToClosingToken(tokens, i, 'list_item_close');
      }
      i++;
    }
    
    return result;
  }

  private getListItemContent(tokens: any[], startIdx: number): string {
    let result = '';
    let i = startIdx + 1;
    
    while (i < tokens.length && tokens[i].type !== 'list_item_close') {
      if (tokens[i].type === 'paragraph_open') {
        const content = this.getInlineContent(tokens, i + 1);
        result += content;
        i = this.skipToClosingToken(tokens, i, 'paragraph_close');
      } else if (tokens[i].type === 'inline') {
        result += this.renderInline(tokens[i].children);
      } else if (tokens[i].type === 'bullet_list_open' || tokens[i].type === 'ordered_list_open') {
        // Handle nested lists
        const listTag = tokens[i].type === 'bullet_list_open' ? 'ul' : 'ol';
        const nestedContent = this.getListContent(tokens, i);
        result += `<${listTag}>${nestedContent}</${listTag}>`;
        i = this.skipToClosingToken(tokens, i, tokens[i].type.replace('_open', '_close'));
      }
      i++;
    }
    
    return result;
  }

  private getBlockquoteContent(tokens: any[], startIdx: number): string {
    let result = '';
    let i = startIdx + 1;
    let content = '';
    
    while (i < tokens.length && tokens[i].type !== 'blockquote_close') {
      if (tokens[i].type === 'paragraph_open') {
        const paragraphContent = this.getInlineContent(tokens, i + 1);
        if (content) content += '</p><p>';
        content += paragraphContent;
        i = this.skipToClosingToken(tokens, i, 'paragraph_close');
      }
      i++;
    }
    
    if (content) {
      result = `<p>${content}</p>`;
    }
    
    return result;
  }

  private getTableContent(tokens: any[], startIdx: number): string {
    let result = '';
    let i = startIdx + 1;
    let currentRow = '';
    
    while (i < tokens.length && tokens[i].type !== 'table_close') {
      switch (tokens[i].type) {
        case 'thead_open':
          result += '<thead>';
          break;
        case 'thead_close':
          result += '</thead>';
          break;
        case 'tbody_open':
          result += '<tbody>';
          break;
        case 'tbody_close':
          result += '</tbody>';
          break;
        case 'tr_open':
          currentRow = '<tr>';
          break;
        case 'tr_close':
          currentRow += '</tr>';
          result += currentRow;
          break;
        case 'th_open':
          currentRow += '<th>';
          break;
        case 'th_close':
          currentRow += '</th>';
          break;
        case 'td_open':
          currentRow += '<td>';
          break;
        case 'td_close':
          currentRow += '</td>';
          break;
        case 'inline':
          currentRow += this.renderInline(tokens[i].children);
          break;
      }
      i++;
    }
    
    return result;
  }

  private skipToClosingToken(tokens: any[], startIdx: number, closingType: string): number {
    let i = startIdx;
    while (i < tokens.length && tokens[i].type !== closingType) {
      i++;
    }
    return i;
  }

  private wrapBlock(blockName: string, content: string, attrs?: any): string {
    const attrString = attrs ? ' ' + JSON.stringify(attrs) : '';
    const open = `<!-- ${blockName}${attrString} -->`;
    const close = `<!-- /${blockName} -->`;
    
    if (this.options.pretty) {
      return `${open}\n${content}\n${close}\n`;
    }
    return `${open}${content}${close}`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  private isGutenbergPlaceholder(token: any): boolean {
    if (token.type === 'html_block' || token.type === 'paragraph_open') {
      const content = token.content || '';
      return content.includes('[[GUTENBERG:') || content.includes('[[/GUTENBERG:');
    }
    if (token.type === 'inline' && token.children) {
      for (const child of token.children) {
        if (child.type === 'text' && (child.content.includes('[[GUTENBERG:') || child.content.includes('[[/GUTENBERG:'))) {
          return true;
        }
      }
    }
    return false;
  }
}