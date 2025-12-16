# Short URL MCP Server

This is the Model Context Protocol (MCP) server for the [Short URL](https://github.com/fengzhongsen/short-url) project. It allows AI assistants (like Claude Desktop) to interact with your Short URL service to generate short links directly from the chat interface.

## Installation

You can run this server directly using `npx` or install it globally.

### Prerequisites

- A running instance of the Short URL service (or use the public one if available/configured).
- An API Key from the Short URL service.

## Usage with Claude Desktop

Add the following configuration to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "short-url": {
      "command": "npx",
      "args": ["-y", "short-mcp-server"],
      "env": {
        "API_ORIGIN": "YOUR_API_ORIGIN",
        "API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

Replace `YOUR_API_KEY_HERE` with your actual API key generated from the Short URL service dashboard.
If you are hosting the service yourself, replace `YOUR_API_ORIGIN` with your own API origin (e.g., `http://localhost:3001`).

## Usage with VS Code

Add the following configuration to your VS Code `settings.json`:

```json
{
  "mcp.servers": {
    "short-url": {
      "command": "npx",
      "args": ["-y", "short-mcp-server"],
      "env": {
        "API_ORIGIN": "YOUR_API_ORIGIN",
        "API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

## Environment Variables

- `API_ORIGIN`: The API origin for creating short URLs (default: `http://localhost:3001`).
- `API_KEY`: (Required) Your API Key for authentication.

## License

MIT
