# Edge Cases Test

## Empty Content

:::group
:::

:::columns
:::column
:::
:::

## Special Characters

Paragraph with & < > " ' characters.

Code with `< > & "` special chars.

## Unicode

日本語のテキスト with 絵文字 🎉

## Malformed Blocks

:::group {invalid json}
Content with invalid attributes
:::

:::no-closing
This block has no closing tag

## Deeply Nested

:::group
:::columns
:::column
:::group
Deep nesting level 4
:::
:::
:::
:::

## Mixed Content

Text before block
:::group
Block content
:::
Text after block

## Multiple Attributes Sources

:::group {.class1 className="class2" .class3}
Testing class merging
:::

## Empty Markdown File