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

## Configuration

You can customize the terminal by modifying the following files:
- `src/config/terminal.config.ts` - Terminal settings
- `src/themes/` - Terminal themes and styles

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.