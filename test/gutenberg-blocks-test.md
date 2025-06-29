# Gutenberg Blocks Test

## Columns Block

:::columns
:::column
### Column 1
First column with **bold text** and `code`.
- List item 1
- List item 2
:::

:::column
### Column 2
Second column with *italic text* and [link](https://example.com).

![Column Image](https://example.com/col-image.jpg)
:::

:::column
### Column 3
Third column content.
:::
:::

## Group Block Variations

:::group
Simple group block content.
:::

:::group {.has-background .has-pale-cyan-blue-background-color}
### Group with Background
This group has a cyan background color.
:::

:::group {id="special-group" className="custom-group" align="wide"}
### Group with Custom Attributes
Wide aligned group with custom ID and class.
:::

## Button Block

[Primary Button](https://example.com/action){.wp-block-button}

## Media & Text Block

:::media-text
![Media Image](https://example.com/media.jpg)

### Media Content
This text appears alongside the media.

With multiple paragraphs supported.
:::

## Cover Block

:::cover {background="https://example.com/hero.jpg"}
# Hero Title
Subtitle text on cover image.

[Call to Action](https://example.com){.wp-block-button}
:::

## Nested Blocks

:::group {className="outer-group"}
### Outer Group

:::columns
:::column
Nested column 1 in group.
:::

:::column
Nested column 2 in group.
:::
:::

More content in outer group.
:::

## Complex Attributes

:::group {layout='{"type":"constrained","contentSize":"800px"}' className="content-wrapper"}
Content with complex layout settings.
:::

:::media-text {mediaPosition="right" mediaType="image"}
![Right Aligned](https://example.com/right.jpg)

Text content with media on the right.
:::