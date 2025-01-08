# Fake Terminal Experience

A React-based terminal emulator that provides a realistic command-line interface experience in the browser.

## Features

- Realistic terminal UI with common terminal features
- Draggable/resizable terminal window
- Support for basic commands like `npm -v`, `node -v`, `npm run dev`
- Terminal window controls (minimize, maximize, close)
- Command history navigation (up/down arrows)
- Custom command output simulation
- Configurable prompt and theme
- Copy/paste support

## Getting Started

### Prerequisites

- Node.js (v20.11.0 or higher)
- npm (v10.2.4 or higher)

### Installation

1. Clone this repository:
```sh
git clone https://github.com/onigetoc/fake-terminal-experience.git
```

2. Navigate to project directory:
```sh
cd fake-terminal-experience
```

3. Install dependencies:
```sh
npm install
```

4. Start the development server:
```sh
npm run dev
```

5. Open your browser and visit http://localhost:5173

## Usage

The terminal supports the following commands:
- `clear` - Clear the terminal screen
- `help` - Display available commands
- `npm -v` - Show npm version
- `node -v` - Show Node.js version
- `npm run dev` - Start development server
- Use up/down arrows to navigate command history

## Configuration

You can customize the terminal by modifying the following files:
- `src/config/terminal.config.ts` - Terminal settings
- `src/themes/` - Terminal themes and styles

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.