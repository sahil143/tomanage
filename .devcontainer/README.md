# ToManage Development Container

This directory contains the configuration for developing ToManage in a containerized environment using GitHub Codespaces or VS Code Dev Containers.

## Features

### 🛠️ Pre-installed Tools
- **Node.js 20** - Latest LTS version
- **pnpm** - Fast, disk space efficient package manager
- **GitHub CLI** - Command-line tool for GitHub
- **Docker-in-Docker** - For containerized workflows

### 🔌 VS Code Extensions

#### Essential
- **Claude Code** - AI-powered coding assistant
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind class completion

#### Git & GitHub
- **GitHub Pull Requests** - PR management
- **GitHub Copilot** - AI pair programming
- **GitLens** - Git supercharged

#### Code Quality
- **Error Lens** - Inline error messages
- **Pretty TypeScript Errors** - Better TS error messages
- **Import Cost** - Display import sizes
- **Spell Checker** - Catch typos

#### Productivity
- **TODO Tree** - Highlight TODO comments
- **Better Comments** - Styled comments
- **Path Intellisense** - File path autocomplete
- **Auto Rename Tag** - Rename paired HTML/JSX tags

## Quick Start

### Using GitHub Codespaces

1. Click the **Code** button on the GitHub repository
2. Select **Codespaces** tab
3. Click **Create codespace on main**
4. Wait for the container to build and initialize
5. Start developing!

### Using VS Code Dev Containers

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
3. Open the project in VS Code
4. Press `F1` and select **Dev Containers: Reopen in Container**
5. Wait for the container to build

## Port Forwarding

The following ports are automatically forwarded:

| Port | Service | Auto-Open |
|------|---------|-----------|
| 3001 | Backend Server | Notify |
| 1420 | Web App | Browser |
| 5173 | Vite Dev Server | Notify |

## Post-Create Commands

After the container is created, the following commands run automatically:

```bash
pnpm install  # Install dependencies
pnpm build    # Build all packages
```

## Environment Variables

The container will mount your local `.env` file if it exists. Create a `.env` file in the project root with:

```env
ANTHROPIC_API_KEY=your_api_key_here
TICKTICK_USERNAME=your_username
TICKTICK_PASSWORD=your_password
```

## Development Workflow

### Starting the Development Servers

```bash
# Terminal 1: Start backend server
pnpm --filter server dev

# Terminal 2: Start web app
pnpm --filter web dev

# Terminal 3: Start desktop app (optional)
pnpm --filter desktop dev
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter web test
```

### Building

```bash
# Build all packages
pnpm build

# Build a specific package
pnpm --filter web build
```

## VS Code Settings

The devcontainer includes optimized VS Code settings for:

- ✅ Format on save with Prettier
- ✅ Auto-fix ESLint errors on save
- ✅ Auto-organize imports
- ✅ TypeScript IntelliSense
- ✅ Tailwind CSS class completion
- ✅ Path aliases (`@/` → `src/`)

## Customization

### Adding Extensions

Edit [`.devcontainer/devcontainer.json`](./devcontainer.json) and add to the `extensions` array:

```json
"customizations": {
  "vscode": {
    "extensions": [
      "your.extension-id"
    ]
  }
}
```

### Modifying Settings

Edit the `settings` object in `devcontainer.json`:

```json
"settings": {
  "your.setting": "value"
}
```

### Installing Additional Tools

Add to the `postCreateCommand`:

```json
"postCreateCommand": "pnpm install && pnpm build && your-custom-command"
```

## Troubleshooting

### Container won't start
1. Check Docker is running
2. Try rebuilding: `F1` → **Dev Containers: Rebuild Container**
3. Check Docker logs for errors

### Extensions not loading
1. Rebuild the container
2. Manually install: `F1` → **Extensions: Install Extensions**
3. Check extension compatibility

### Port forwarding issues
1. Check the **Ports** tab in VS Code
2. Manually forward: `F1` → **Forward a Port**
3. Ensure services are running

## Resources

- [VS Code Dev Containers Docs](https://code.visualstudio.com/docs/devcontainers/containers)
- [GitHub Codespaces Docs](https://docs.github.com/en/codespaces)
- [Dev Container Specification](https://containers.dev/)
