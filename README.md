# Toolbox

A modern utility toolkit application built with Vue.js and Electron.

## Features

- Modern minimalist UI with dark mode support
- Organized tools by category
- Responsive and intuitive interface
- Cross-platform support (Windows, macOS, Linux)

## Development

### Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x)

### Setup

1. Clone the repository
```
git clone https://github.com/yourusername/toolbox.git
cd toolbox
```

2. Install dependencies
```
npm install
```

3. Run in development mode
```
npm run electron:dev
```

This will start both the Vue.js development server and launch the Electron application.

### Building

To build the application for production:

```
npm run electron:build
```

This will create distributable packages in the `build` directory.

## UI Design Details

- Primary color: #2B73FF (Tech Blue)
- Success color: #00C853 (Safe Green)
- Warning color: #FF5252 (Alert Red)
- Sidebar width: 200px fixed
- Modern icons with 2px stroke
- Card-based tool layout with hover effects
- Consistent spacing and typography

## License

MIT
