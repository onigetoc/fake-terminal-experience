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
- **Cross-Platform Command Translation**: Automatically translates commands between different operating systems
  - Example: `ls` on Windows becomes `dir`, and `dir` on Unix becomes `ls`
  - Works with most common terminal commands:
    ```bash
    # Windows to Unix translation
    type package.json  ->  cat package.json
    dir               ->  ls
    findstr           ->  grep

    # Unix to Windows translation
    cat package.json  ->  type package.json
    ls               ->  dir
    grep             ->  findstr
    ```

### Supported Command Translations

| Windows Command | Unix Command (MacOS/Linux) | Description |
|----------------|---------------------------|-------------|
| type           | cat                      | Display file contents |
| dir            | ls                       | List directory contents |
| findstr        | grep                     | Search text patterns |
| cls            | clear                    | Clear screen |
| copy           | cp                       | Copy files |
| move           | mv                       | Move/rename files |
| del            | rm                       | Delete files |
| echo           | echo                     | Display messages |
| tasklist       | ps                       | List processes |
| taskkill       | kill                    | Terminate processes |

The terminal automatically detects your operating system and translates commands accordingly, providing a seamless experience across different platforms.

## Screenshots

Here are some screenshots of the Fake Terminal Experience in action:

### Terminal UI
![Terminal UI](https://raw.githubusercontent.com/onigetoc/fake-terminal-experience/refs/heads/main/public/terminal-screenshot.png)

![Terminal UI anime](https://raw.githubusercontent.com/onigetoc/fake-terminal-experience/refs/heads/main/public/terminal-anime.gif)

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

## How to use in your own project

To use the Fake Terminal Experience in your project, follow these steps:

1. Clone this repository:
```sh
git clone https://github.com/onigetoc/fake-terminal-experience.git
```

2. Copy all folders and files from the fake-terminal-experience project into your React project, except for `pages/index.tsx` to avoid overwriting your existing index file.

3. In your `package.json`, add the following script:
    ```json
    "scripts": {
      "start:terminal-server": "node src/server/index.js"
    }
    ```

4. Install the necessary dependencies (list the main dependencies here).

5. Run the server:
    ```bash
    npm run start:terminal-server
    ```

## Usage

To use the terminal in your React component, import and add the Terminal component:
```javascript
import Terminal from "@/components/Terminal/Terminal";

const YourComponent = () => {
  return (
    <div>
      <h1>Your Component</h1>
      <Terminal />
    </div>
  );
};

export default YourComponent;
```

### Example Usage

```javascript
import Terminal from "@/components/Terminal/Terminal";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-4">Terminal Demo</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Try running some commands like "npm -v" or type "help" to see available commands.
        </p>
      </div>
      <Terminal />
    </div>
  );
};

export default Index;
```

Make sure to start both your React application and the terminal server for full functionality.

5. Open your browser and visit http://localhost:5173

## Usage

The terminal supports the following commands:
- `clear` - Clear the terminal screen
- `help` - Display available commands
- `npm -v` - Show npm version
- `node -v` - Show Node.js version
- `npm run dev` - Start development server
- Use up/down arrows to navigate command history

### Displaying Commands in the Terminal

You can choose whether to display a command in the terminal or not by using the `displayInTerminal` argument.

#### Backend

```javascript
// Display the command in the terminal (default)
executeCommand("npm -v");
// or
executeCommand("npm -v", 1);

// Do not display the command in the terminal
executeCommand("npm -v", 0);
```

#### Frontend

```javascript
// Display the command in the terminal (default)
handleRunCommand("npm -v");
// or
handleRunCommand("npm -v", 1);

// Do not display the command in the terminal
handleRunCommand("npm -v", 0);
```

## Configuration

You can customize the terminal by modifying the following files:
- `src/config/terminal.config.ts` - Terminal settings
- `src/themes/` - Terminal themes and styles

### Customizing the Terminal

The `terminalConfig.ts` file allows you to customize various aspects of the terminal. Here are the available options:

| Option                | Type      | Default Value | Description                                      |
|-----------------------|-----------|---------------|--------------------------------------------------|
| initialState          | string    | 'open'        | Initial state of the terminal ('open', 'minimized', 'hidden') |
| startFullscreen       | boolean   | false         | Start in fullscreen mode                         |
| startMinimized        | boolean   | false         | Start in minimized mode                          |
| defaultHeight         | number    | 320           | Default height of the terminal window            |
| minHeight             | number    | 200           | Minimum height of the terminal window            |
| minWidth              | number    | 300           | Minimum width of the terminal window             |
| showExecutedCommands  | boolean   | true          | Show executed commands in the terminal           |
| keepCommandHistory    | boolean   | true          | Keep command history                             |
| maxHistoryLength      | number    | 100           | Maximum length of command history                |
| theme                 | string    | 'dark'        | 'dark', 'light', or custom theme name            |
| fontSize              | number    | 14            | Font size in the terminal                        |
| fontFamily            | string    | 'monospace'   | Font family in the terminal                      |
| readOnlyMode          | boolean   | false         | If true, disables input in the terminal          |
| showTerminal          | boolean   | true          | If false, hides the terminal completely          |
| showFloatingButton    | boolean   | true          | Show floating button to open terminal            |
| showPath              | boolean   | true          | Show current path in the terminal                |
| maxOutputLength       | number    | 1000          | Maximum length of terminal output                |
| scrollbackLimit       | number    | 1000          | Scrollback limit in the terminal                 |

You can modify these options to fit your needs. For example, to start the terminal in minimized mode with a custom prompt symbol, you can update the configuration as follows:

```typescript
import { terminalConfig } from '@/config/terminalConfig';

terminalConfig.set({
  initialState: 'minimized',
  promptSymbol: '$',
  // Other configurations...
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## TODO
- Add search in terminal
- More setting options