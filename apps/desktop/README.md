# ToManage Desktop

Tauri wrapper that adds native Mac features (menu bar, keyboard shortcuts) to the web app.

## Architecture

This is a **Tauri wrapper** around the web app:

```
desktop/
└── tauri/              # Rust code for native features
    ├── src/
    │   ├── main.rs     # Entry point
    │   └── lib.rs      # Tauri app setup
    ├── Cargo.toml      # Rust dependencies
    └── tauri.conf.json # Tauri configuration
```

The actual React app lives in `../web/`

## How It Works

### Development
```bash
pnpm dev:desktop
```

This:
1. Starts the web app on `localhost:1420`
2. Launches Tauri window pointing to it
3. Adds native features (menu bar, shortcuts, etc.)

### Production
```bash
pnpm build:desktop
```

This:
1. Builds the web app to `web/dist/`
2. Bundles it into a native Mac `.app`
3. Result: Standalone desktop app

## Native Features

### Current
- [x] Native window
- [x] Mac app bundle

### Coming Soon
- [ ] Menu bar integration
- [ ] Global keyboard shortcuts (Cmd+Shift+Space)
- [ ] System notifications
- [ ] Auto-launch on startup

## Development

To add native features, edit `tauri/src/lib.rs`

```rust
// Example: Add a Tauri command
#[tauri::command]
fn create_todo(title: String) -> String {
    format!("Created: {}", title)
}

// Then register it:
.invoke_handler(tauri::generate_handler![create_todo])
```

## Tech Stack

- **Tauri 2.x** - Desktop framework
- **Rust** - Native backend
- **Web App** - React frontend (in `../web/`)
