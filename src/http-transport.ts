import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { convertMarkdownToGutenberg } from './converter.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';

export async function runMcpHttpServer(port: number = 3000) {
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

  // Set up tool handlers (reuse from mcp-server.ts)
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

  // Create Express app for HTTP server
  const app = express();
  app.use(express.json());

  // Bearer authentication middleware
  app.use('/mcp', (req, res, next) => {
    if (!process.env.API_TOKEN) {
      // No authentication required
      return next();
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (token !== process.env.API_TOKEN) {
      return res.status(401).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Unauthorized'
        },
        id: null
      });
    }
    
    next();
  });

  // Create stateless HTTP transport
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless mode
    enableJsonResponse: true, // Return JSON instead of SSE
  });

  await server.connect(transport);

  // Handle MCP requests
  app.post('/mcp', async (req, res) => {
    await transport.handleRequest(req, res, req.body);
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'markwp-mcp-http' });
  });

  // Start Express server
  const httpServer = app.listen(port, () => {
    console.log(`MCP HTTP server running on http://localhost:${port}/mcp`);
    if (process.env.API_TOKEN) {
      console.log('Bearer authentication enabled');
    } else {
      console.log('Warning: Running without authentication (API_TOKEN not set)');
    }
    console.log('\nTest with MCP Inspector:');
    console.log(`npx @modelcontextprotocol/inspector --cli http://localhost:${port}/mcp`);
  });

  process.on('SIGINT', async () => {
    await server.close();
    httpServer.close();
    process.exit(0);
  });
}