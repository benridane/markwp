import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { convertMarkdownToGutenberg } from './converter.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function runMcpServer() {
  const server = new Server(
    {
      name: 'markwp-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'convert_markdown',
          description: 'Convert Markdown text to WordPress Gutenberg block format',
          inputSchema: {
            type: 'object',
            properties: {
              markdown: {
                type: 'string',
                description: 'The Markdown text to convert',
              },
              pretty: {
                type: 'boolean',
                description: 'Whether to pretty print the output',
                default: false,
              },
            },
            required: ['markdown'],
          },
        },
        {
          name: 'convert_file',
          description: 'Convert a Markdown file to WordPress Gutenberg block format',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: {
                type: 'string',
                description: 'Path to the Markdown file to convert',
              },
              outputPath: {
                type: 'string',
                description: 'Optional path to save the converted output',
              },
              pretty: {
                type: 'boolean',
                description: 'Whether to pretty print the output',
                default: false,
              },
            },
            required: ['filePath'],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
      case 'convert_markdown': {
        const { markdown, pretty = false } = request.params.arguments as {
          markdown: string;
          pretty?: boolean;
        };

        try {
          const result = convertMarkdownToGutenberg(markdown, { pretty });
          return {
            content: [
              {
                type: 'text',
                text: result,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error converting markdown: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }

      case 'convert_file': {
        const { filePath, outputPath, pretty = false } = request.params.arguments as {
          filePath: string;
          outputPath?: string;
          pretty?: boolean;
        };

        try {
          const absolutePath = path.resolve(filePath);
          const content = await fs.readFile(absolutePath, 'utf-8');
          const result = convertMarkdownToGutenberg(content, { pretty });

          if (outputPath) {
            const absOutputPath = path.resolve(outputPath);
            await fs.writeFile(absOutputPath, result);
            return {
              content: [
                {
                  type: 'text',
                  text: `Successfully converted ${filePath} to ${outputPath}`,
                },
              ],
            };
          } else {
            return {
              content: [
                {
                  type: 'text',
                  text: result,
                },
              ],
            };
          }
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error converting file: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });
}