# MCP HTTP Server Testing Guide

This guide explains how to test the MarkWP MCP HTTP server using the MCP Inspector.

## Prerequisites

- Node.js 18 or higher
- npm or npx
- MCP Inspector: `@modelcontextprotocol/inspector`

## Starting the Server

### Local Development

```bash
# Build the project
npm run build

# Start the HTTP server (default port 3000)
node dist/index.js --mcp-http

# Start with custom port
node dist/index.js --mcp-http --port 8080

# Start with authentication
API_TOKEN=your-secret-token node dist/index.js --mcp-http
```

### Using Docker

```bash
# Create .env file
cp .env.example .env
# Edit .env and set your API_TOKEN

# Start with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the server
docker-compose down
```

## Testing with MCP Inspector

### CLI Mode

1. **List available tools:**
```bash
npx @modelcontextprotocol/inspector --cli http://localhost:3000/mcp --method tools/list
```

2. **Convert Markdown text:**
```bash
npx @modelcontextprotocol/inspector --cli http://localhost:3000/mcp \
  --method tools/call \
  --tool-name convert_markdown \
  --tool-arg markdown="# Hello World\n\nThis is a test."
```

3. **Convert with pretty printing:**
```bash
npx @modelcontextprotocol/inspector --cli http://localhost:3000/mcp \
  --method tools/call \
  --tool-name convert_markdown \
  --tool-arg markdown="# Title" \
  --tool-arg pretty=true
```

4. **Convert a file:**
```bash
npx @modelcontextprotocol/inspector --cli http://localhost:3000/mcp \
  --method tools/call \
  --tool-name convert_file \
  --tool-arg filePath="./test.md"
```

### With Authentication

If API_TOKEN is set, you need to provide the Bearer token:

#### CLI Mode Limitation
**Important**: The MCP Inspector CLI mode does NOT support Bearer authentication directly. The CLI lacks authentication flags or options.

For authenticated testing, you have these options:

1. **Use curl directly** (recommended for CLI testing):
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer your-secret-token" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

2. **Use the Inspector Web UI** (supports full authentication):
   - Start the web UI with `npx @modelcontextprotocol/inspector`
   - Use the authentication options in the connection dialog

3. **Temporarily disable authentication** for testing:
```bash
# Run server without authentication
markwp --mcp-http --port 3000

# Then use Inspector CLI normally
npx @modelcontextprotocol/inspector --cli http://localhost:3000/mcp --method tools/list
```

### UI Mode

1. **Start the Inspector UI:**
```bash
npx @modelcontextprotocol/inspector
```

2. **Connect to the server:**
- Open browser at http://localhost:6274
- Or use direct URL: `http://localhost:6274/?transport=streamable-http&serverUrl=http://localhost:3000/mcp`

3. **In the UI:**
- Select "streamable-http" as transport type
- Enter server URL: `http://localhost:3000/mcp` (include `http://` prefix!)
- Common mistake: Don't use `localhost:3000/mcp` without the protocol
- If authentication is enabled:
  - Look for the authentication section in the connection dialog
  - Select "Bearer" as the authentication type
  - Enter your token in the token field
- Click "Connect"

4. **Test the tools:**
- Navigate to "Tools" tab
- Select `convert_markdown` or `convert_file`
- Fill in the parameters
- Click "Call Tool"
- View the results

## Testing with curl

You can also test directly with curl:

```bash
# Without authentication
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'

# With authentication
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-token" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "convert_markdown",
      "arguments": {
        "markdown": "# Hello World",
        "pretty": true
      }
    }
  }'
```

## Expected Responses

### Tools List Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "convert_markdown",
        "description": "Convert Markdown text to WordPress Gutenberg block format",
        "inputSchema": { ... }
      },
      {
        "name": "convert_file",
        "description": "Convert a Markdown file to WordPress Gutenberg block format",
        "inputSchema": { ... }
      }
    ]
  }
}
```

### Conversion Response
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "<!-- wp:heading {\"level\":1} -->\n<h1>Hello World</h1>\n<!-- /wp:heading -->"
      }
    ]
  }
}
```

## Troubleshooting

1. **Connection refused:**
   - Ensure the server is running
   - Check the port number
   - Verify no firewall blocking

2. **Authentication error:**
   - Ensure API_TOKEN is set correctly
   - Include Bearer token in requests

3. **Tool not found:**
   - Verify tool name is correct
   - Use `tools/list` to see available tools

4. **File not found:**
   - Use absolute paths for files
   - Ensure file exists and is readable