# MarkWP - Markdown to WordPress Gutenberg Converter

A command-line tool to convert Markdown files to WordPress Gutenberg block format.

## Features

- Convert Markdown text or files to Gutenberg blocks
- Support for various Markdown elements (headings, lists, code blocks, images, tables, etc.)
- Command-line interface with flexible input/output options
- Pretty printing and debug modes
- TypeScript implementation
- MCP (Model Context Protocol) server mode for integration with AI tools

## Installation

### From npm (if published)
```bash
npm install -g markwp
```

### From source
```bash
git clone https://github.com/benridane/markwp.git
cd markwp
npm install
npm run build
npm link
```

## Usage

### Basic usage
```bash
# Convert Markdown text directly
markwp "# Hello World" output.html

# Convert a Markdown file
markwp -f input.md output.html

# Output to stdout
markwp -f input.md

# Pretty print the output
markwp -f input.md -p

# Enable debug mode
markwp -f input.md -d
```

### Options

- `-f, --file`: Treat input as file path instead of text
- `-d, --debug`: Enable debug mode
- `-p, --pretty`: Pretty print output
- `--mcp`: Run as MCP server (stdio transport)
- `--mcp-http`: Run as MCP HTTP server (streamable HTTP transport)
- `--port <port>`: Port for HTTP server (default: 3000)
- `-h, --help`: Display help information
- `-V, --version`: Display version number

## Examples

### Converting a simple Markdown file
```bash
markwp -f example.md -p > output.html
```

### Converting inline Markdown
```bash
markwp "## Heading\n\nThis is a paragraph with **bold** text." -p
```

### Running as MCP server

#### Stdio Transport
```bash
# Start the MCP server with stdio transport
markwp --mcp
```

#### HTTP Transport
```bash
# Start the MCP HTTP server (default port 3000)
markwp --mcp-http

# Start with custom port
markwp --mcp-http --port 8080

# Start with Bearer authentication
API_TOKEN=your-secret-token markwp --mcp-http
```

The servers expose two tools:
- `convert_markdown`: Convert Markdown text to Gutenberg format
- `convert_file`: Convert a Markdown file to Gutenberg format

When running in MCP mode, the tool integrates with AI assistants and other MCP-compatible clients, allowing them to use MarkWP's conversion capabilities programmatically.

### Docker Usage

```bash
# Create .env file with your API token
echo "API_TOKEN=your-secret-token" > .env

# Start with Docker Compose
docker-compose up -d

# The HTTP server will be available at http://localhost:3000/mcp
```

### Testing with MCP Inspector

```bash
# Test with CLI
npx @modelcontextprotocol/inspector --cli http://localhost:3000/mcp

# Test with UI
npx @modelcontextprotocol/inspector
# Then connect to http://localhost:3000/mcp
```

## Development

### Prerequisites
- Node.js (v16 or higher)
- TypeScript

### Setup
```bash
git clone https://github.com/benridane/markwp.git
cd markwp
npm install
```

### Scripts
```bash
npm run build     # Build the project
npm run dev       # Run in development mode
npm start         # Run the built version
npm run clean     # Clean build files
```

## Supported Markdown Elements

- Headings (H1-H6)
- Paragraphs
- Bold and italic text
- Inline code
- Code blocks with syntax highlighting
- Lists (ordered and unordered)
- Links
- Images
- Tables
- Blockquotes
- Horizontal rules

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with TypeScript and Commander.js
- Inspired by the WordPress Gutenberg block editor