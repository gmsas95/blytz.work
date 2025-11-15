# Figma MCP Server Integration

This project now supports Figma MCP server integration for design-to-code workflows.

## Setup Instructions

### Option 1: Remote MCP Server (Quick Setup)

1. **For VS Code Users:**
   - Press `⌘ Shift P` (or `Ctrl Shift P` on Windows)
   - Type "MCP: Open User Configuration"
   - The configuration is already added in `.vscode/mcp.json`
   - Click "Start" and "Allow Access"

2. **For Cursor Users:**
   - Click this deep link: `cursor://anysphere.cursor-deeplink/mcp/install?name=Figma&config=eyJ1cmwiOiJodHRwczovL21jcC5maWdtYS5jb20vbWNwIn0%3D`
   - Click "Install" → "Connect" → "Allow Access"

3. **For Claude Code Users:**
   ```bash
   claude mcp add --transport http figma https://mcp.figma.com/mcp
   ```

### Option 2: Desktop MCP Server (Advanced Features)

1. **Prerequisites:**
   - Install [Figma desktop app](https://www.figma.com/downloads/)
   - You need Dev or Full seat on paid plans

2. **Setup Steps:**
   - Open Figma desktop app
   - Open or create a design file
   - Toggle to Dev Mode (Shift + D)
   - In inspect panel, click "Enable desktop MCP server"
   - Server runs at `http://127.0.0.1:3845/mcp`

## Usage Examples

### Generate Components from Figma Designs
```bash
# Generate React component with Tailwind
"Generate my Figma selection as a React component using Tailwind CSS"

# Use existing UI components
"Generate my Figma selection using components from src/components/ui"

# Different frameworks
"Generate my Figma selection in Vue"
"Generate my Figma selection in plain HTML + CSS"
```

### Extract Design Variables
```bash
"Get variables used in my Figma selection"
"What color and spacing variables are used in my Figma selection?"
```

### Framework-Specific Templates

#### React + Tailwind (Default)
- Uses existing Button.tsx component
- Integrates with Tailwind classes
- Follows your project's component structure

#### Component Integration
```bash
"Generate my Figma selection using components from src/components/ui and style with Tailwind"
```

## Available Tools

1. `get_design_context` - Generate code from selections
2. `get_variable_defs` - Extract design variables
3. `get_code_connect_map` - Map nodes to components
4. `get_screenshot` - Capture screenshots
5. `create_design_system_rules` - Create design rules
6. `get_metadata` - Get basic properties
7. `get_figjam` - Convert FigJam to XML
8. `whoami` - Check authentication

## Project Integration

### UI Components Location
- Path: `frontend/src/components/ui/`
- Available components: Button, Alert, ImprovedAlert, etc.
- Style: Tailwind CSS

### Design Tokens
- Colors: Uses Tailwind color palette
- Spacing: Follows Tailwind spacing scale
- Typography: Consistent with Tailwind font system

## Rate Limits & Access

- **Starter/View/Collab**: 6 tool calls/month
- **Dev/Full**: Per-minute rate limits (Figma REST API Tier 1)
- **Remote server**: Available on all plans
- **Desktop server**: Requires Dev or Full seats

## Troubleshooting

### Authentication Issues
- Run `whoami` tool to verify authentication
- Check file permissions and access rights
- Verify your Figma plan allows MCP usage

### Tool Not Available
- Restart Figma desktop app (for desktop server)
- Check MCP client configuration
- Verify server URL is accessible

### Code Generation Issues
- Ensure UI components exist in expected paths
- Check Tailwind class compatibility
- Verify React component structure

## Best Practices

1. **Design Preparation**
   - Use proper naming conventions in Figma
   - Organize layers logically
   - Set up design variables

2. **Code Generation**
   - Use existing components when possible
   - Follow established styling patterns
   - Test generated components

3. **Workflow Integration**
   - Start with remote server for testing
   - Upgrade to desktop server for production
   - Use design variables consistently