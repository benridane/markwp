# Comprehensive Test for Markdown to Gutenberg Converter

This document tests all features across Phase 1, 2, and 3.

## Basic Text Elements

This is a simple paragraph with **bold text**, *italic text*, and `inline code`.

Here's another paragraph with a [link to example.com](https://example.com "Link Title").

### Lists

Unordered list:
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

Ordered list:
1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

## Quotes and Code

> This is a blockquote.
> It can span multiple lines.
> 
> And have multiple paragraphs.

```javascript
// Code block with syntax highlighting
function hello() {
  console.log('Hello, Gutenberg!');
}
```

## Media

![Sample Image](https://example.com/sample.jpg "Image Caption")

---

## Table

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |

## Advanced Blocks

### Columns Layout

:::columns
:::column
#### Left Column
This is content in the left column.
It can have multiple paragraphs.

And even **formatted text**.
:::

:::column  
#### Right Column
This is content in the right column.
- With a list
- Of items
:::
:::

### Group with Background

:::group {.has-background .has-pale-pink-background-color}
#### Grouped Content
This content is inside a group with a pink background.
It demonstrates the group block functionality.
:::

### Button

[Download Now](https://example.com/download){.wp-block-button}

### Media & Text

:::media-text
![Side Image](https://example.com/side-image.jpg)

This text appears alongside the image in a media-text block.
It's useful for creating side-by-side layouts.
:::

### Cover Block

:::cover {background="https://example.com/hero-bg.jpg"}
# Welcome to Our Site
This is a hero section with a background image.
:::

### Custom Block with Attributes

:::group {id="special-section" align="wide" className="custom-section featured-content"}
This demonstrates custom attributes:
- Custom ID: special-section
- Alignment: wide
- Multiple CSS classes
:::

## Raw HTML

<div class="custom-html">
  <p>This is raw HTML content.</p>
  <span>It should be wrapped in a custom HTML block.</span>
</div>

## Conclusion

This test file covers all major features implemented in the Markdown to Gutenberg converter.