# TerminalX Experience

A powerful React-based web-based terminal emulator that provides both visual terminal interface and server-side command execution capabilities. This project creates an immersive command-line environment directly in your browser, combining the flexibility of a virtual terminal with real server interactions.

## Features

Key capabilities:
- Full terminal emulation in browser
- Real command execution via server integration
- Cross-platform command translation
- Rich terminal UI with window controls
- Command history and autocompletion
- Customizable themes and configurations

Perfect for:
- Web-based development environments
- Remote system administration
- Educational platforms
- Command-line training
- Cloud-based terminal access

React-based terminal emulator that provides a realistic command-line interface experience in the browser.

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
| initialState          | string    | 'open'        | Terminal initial state ('open', 'minimized', 'hidden') |
| readOnlyMode          | boolean   | false         | If true, disables input and all user interactions with the terminal |
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
| showTerminal          | boolean   | true          | If false, hides the terminal completely          |
| showFloatingButton    | boolean   | true          | Show floating button to open terminal            |
| showPath              | boolean   | true          | Show current path in the terminal                |
| maxOutputLength       | number    | 1000          | Maximum length of terminal output                |
| scrollbackLimit       | number    | 1000          | Scrollback limit in the terminal                 |

You can modify these options to fit your needs. For example, to start the terminal in minimized mode with a custom prompt symbol, you can update the configuration as follows:

```typescript
import { terminalConfig } from '@/config/terminalConfig';

terminalConfig.set({
  readOnlyMode: true, // If true, disables input and all user interactions with the terminal 
  fontSize: 15,   
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
```
fake-terminal-experience
├─ .aider.chat.history.md
├─ .clinerules
├─ .cursorrules.md
├─ .git
│  ├─ COMMIT_EDITMSG
│  ├─ config
│  ├─ description
│  ├─ FETCH_HEAD
│  ├─ HEAD
│  ├─ hooks
│  │  ├─ applypatch-msg.sample
│  │  ├─ commit-msg.sample
│  │  ├─ fsmonitor-watchman.sample
│  │  ├─ post-update.sample
│  │  ├─ pre-applypatch.sample
│  │  ├─ pre-commit.sample
│  │  ├─ pre-merge-commit.sample
│  │  ├─ pre-push.sample
│  │  ├─ pre-rebase.sample
│  │  ├─ pre-receive.sample
│  │  ├─ prepare-commit-msg.sample
│  │  ├─ push-to-checkout.sample
│  │  ├─ sendemail-validate.sample
│  │  └─ update.sample
│  ├─ index
│  ├─ info
│  │  └─ exclude
│  ├─ objects
│  │  ├─ 00
│  │  │  ├─ 2db7fa738a2b885d552c8d5999fef9e0628439
│  │  │  ├─ 53afe7ec6f19d4b2d17aa22305d383c975bea6
│  │  │  └─ 7db2bd1acdc519482c90d90da14d93aac38c0f
│  │  ├─ 01
│  │  │  └─ 573a340c3ca4759181b5e981ca318458ff8143
│  │  ├─ 02
│  │  │  ├─ 1528fd89647283c33706ec008a4bd6c53be005
│  │  │  └─ 2343abb0348602e21a11be9db9620c98e4e77d
│  │  ├─ 03
│  │  │  └─ a1c033317d08ed002d5001bbcf199cbc9bd004
│  │  ├─ 04
│  │  │  ├─ 322c34b717decc31f8cc110f9bf788e9eb2b2b
│  │  │  └─ adc7775c79b48846c906aea678224d1d2a4cc4
│  │  ├─ 05
│  │  │  ├─ 06fbed564c7e2300310ee85f0c2c3eeb8788b5
│  │  │  ├─ 0eac39edc46fbb328c5ee68b3a4598f042e758
│  │  │  ├─ 28f40323d9b91eb8c5654c558b9000fc8a2f26
│  │  │  ├─ 8096076d7ca87129dfa93e534c4b01d7c82df8
│  │  │  └─ e3479120a95ebb04bdc634e53cac8de5186ef7
│  │  ├─ 06
│  │  │  ├─ 0c2a8abd1c7f0bfc3120c0e04102fbd282a9ba
│  │  │  ├─ 4477f5bf6b125d84192eb4e63c490db1ff265b
│  │  │  └─ b71621a7fd7febe9f1264aeb98e1c2e9a480e4
│  │  ├─ 07
│  │  │  ├─ 13da03bc3b652155a12939be03dbd748a540e9
│  │  │  ├─ 41a73c3a970a54cced096db33cc9f2c8a32a97
│  │  │  └─ 9135f0046f4a69f70a8770aee28d06009ecd0e
│  │  ├─ 09
│  │  │  └─ bbfdad2c3df4d752b71155c060602786dbb79d
│  │  ├─ 0b
│  │  │  └─ 9adcd89c0ea3350b895cfd19e4b76d87ac2d80
│  │  ├─ 0c
│  │  │  ├─ 6ee9d18cce995a6b42ece644e7e1818afe1842
│  │  │  └─ a6d19269ed6cc79ea2756f6636804865485596
│  │  ├─ 0d
│  │  │  ├─ 104f846c02bcaa097873cb2dbe7cc7a94a06e3
│  │  │  ├─ 1dd59d9992097487470415d8849c5d175f5900
│  │  │  ├─ 3cdff2bc65c8441d4d6d3f539a5f15392ad0c3
│  │  │  └─ f744c1d46c840c658ccfcb35a2a796175e7b12
│  │  ├─ 0e
│  │  │  ├─ 202054aca9e104fbe2bde53eb95184605fab16
│  │  │  └─ 53de837c766393be7297e3b047490ee7d154d3
│  │  ├─ 0f
│  │  │  ├─ c66280288e28e051b68383af2698ff7db82f71
│  │  │  ├─ e9c2accb69b00eae51cc3de30a6a7d09daf550
│  │  │  └─ f47b2339783cfe85bc0f447a0f7dd9286f06c2
│  │  ├─ 10
│  │  │  └─ a08dc63c992f8a4cd91c109b3e9fc9a2293c6d
│  │  ├─ 12
│  │  │  └─ 4beed42cb879b2fff8bf59b46d50fd5c33951f
│  │  ├─ 13
│  │  │  └─ c0186f0f53856c172d3ae33d7224fa1b235c8a
│  │  ├─ 14
│  │  │  └─ 4735dd1df58a8345b0d5d5ad076f423d42fbca
│  │  ├─ 15
│  │  │  └─ 7874b59e9f0df48f48e03e14b0fccf72cf5d91
│  │  ├─ 18
│  │  │  ├─ 343bfdb78c24f8bfa9d4bdaeb8d29207390093
│  │  │  ├─ 50451a3fafa7630c8aea27f8211eda5c31fac8
│  │  │  └─ e369c22a4b9b5529a4b9985736bd26acb764ac
│  │  ├─ 19
│  │  │  ├─ bffe0710dda3955acc85806ed6ce36f38a8d18
│  │  │  ├─ ccc8c8344030464a51a8a222d6ec128b0028fc
│  │  │  ├─ fa1d3f20317c5bde2d5c9d1abd9a97b68f0dd2
│  │  │  ├─ fcc4bc89f8be1f316d1b4c43368aa2b1ee1183
│  │  │  └─ fe9eb3678c325d4f717640857ed93623b54c0e
│  │  ├─ 1a
│  │  │  └─ dbfaf08e74e3d2a0aa01434084a7e97d376261
│  │  ├─ 1b
│  │  │  └─ e22f9ee35857923e1861bc0ff439a641f33309
│  │  ├─ 1c
│  │  │  ├─ 48b4f66bbeea70ac3f63acd6fbb440a596819a
│  │  │  └─ c8558a670076c3d3aee7049e82b8a6c6a55330
│  │  ├─ 1d
│  │  │  ├─ 0e93ae73c71c8348924341e6e43837b98fc15c
│  │  │  └─ 9c1a58c3b79925a24c97eac283810e788f4895
│  │  ├─ 1e
│  │  │  └─ a0cc9040d4f506dfb24fe2c675b5ecdb8346cc
│  │  ├─ 1f
│  │  │  ├─ 47cf542d117a6b096b4b2a1d329620f57ba05e
│  │  │  └─ db315eabc3d6d157a43f88b18962ebbd6f185d
│  │  ├─ 20
│  │  │  ├─ 38437be87acb0c8696ef970d809359f575b1ec
│  │  │  ├─ 55ee37e516fb9df31fe87129c62fa0f0819331
│  │  │  └─ ddb3f96995d6fbdbf77e1ba78dcc7bc337118f
│  │  ├─ 22
│  │  │  ├─ 309d401b35967630c4c2b45fe4e7ff98b31a25
│  │  │  ├─ 62dc46fed15e36c589f192311b9d78738e377c
│  │  │  ├─ 648ff9bbc633b3f885e6e9a684d18f84f9c80e
│  │  │  ├─ 992f71227d280867aff499dca670df6c011847
│  │  │  ├─ cb806b5ea65a0be121f8c1f761c111d9d6f9c7
│  │  │  └─ f3678b9dab38214a4848b06c18e722cc6160a4
│  │  ├─ 23
│  │  │  ├─ 6c6b92e69e635abb416d508368e0e30c5ea394
│  │  │  └─ b6aab6cf94e504e96d0d895a786cb39e49e25a
│  │  ├─ 25
│  │  │  ├─ 120dac16b630b08055015f9ba48e38ceeed8f7
│  │  │  ├─ 3a3fffb23fd1ef73f6fad2b4579e8b2dd6b819
│  │  │  └─ 542b16fb52f0b15105878295295b26b36b209c
│  │  ├─ 26
│  │  │  ├─ 2cf288f1053e7536e4e4ba6b70d6c8ac052928
│  │  │  └─ e6d808b8c905d2cd5ae61190e207fc91e6de2f
│  │  ├─ 27
│  │  │  ├─ 2646287487b9da7fa9321de5df51c4e1619dc9
│  │  │  └─ dc7924f5764c2e2e5dca4f4d86372282d11295
│  │  ├─ 29
│  │  │  ├─ b4bb7084a9b5f848602016483d30d607e3d316
│  │  │  ├─ c07931331da3489cf298efdd8ec9dba3f20663
│  │  │  └─ e09d1a9c3195dec11d8eb065132947168ec4fb
│  │  ├─ 2a
│  │  │  ├─ 38cb0670ebab3a13c3aa028edc70a6b0e12e5a
│  │  │  ├─ 808c22528b5f531b0c5844a26a4a86cecbf7e4
│  │  │  └─ fb169fee731b77142f1b89456c5aec06bb92f7
│  │  ├─ 2b
│  │  │  ├─ e00be4919f5040ae183fc7a4feae6c3f1a6a2e
│  │  │  ├─ e5c3e1148fc0ac985fa3bf00000178c3ee7fea
│  │  │  └─ fa0f82a2b65ea46f1158bd1f75b8cf888fd809
│  │  ├─ 2c
│  │  │  ├─ 55d1000d4064e4151a05db34f6faf2da318218
│  │  │  └─ ac89138e100acd535bc32130af839e2b7f4973
│  │  ├─ 2e
│  │  │  └─ 0c4f9f2b54051e0232f2a5609eb550c3bc051e
│  │  ├─ 2f
│  │  │  └─ 18aa91e3524c081e2855c2b73503a4c29c99f0
│  │  ├─ 30
│  │  │  └─ 46e7ca6b9f6952720820125f55ccc6fd588b80
│  │  ├─ 31
│  │  │  ├─ 337b5e4de0ea26b79fce1d019f11bf9409aa71
│  │  │  ├─ 9db9830d62102ca415504316cbab437f3f0a6d
│  │  │  └─ f065a31c3f2386718e31897b58d557f8b6d968
│  │  ├─ 32
│  │  │  ├─ 3fea7a22ad3645e3dd484b0dfb90f9509347c8
│  │  │  ├─ 9905b9a7199971a1565fb16090b7b11df04f83
│  │  │  └─ 9cad1ef9c01598ff98c4a200b8a768545f594c
│  │  ├─ 33
│  │  │  ├─ 4636c87c6f714e7b8c83b5b7ff75e81b337054
│  │  │  ├─ 6a3bad92f5a0a4c9f053bbb72804684b00a037
│  │  │  └─ a889ee51c8948c796d13e30964ded07496e336
│  │  ├─ 35
│  │  │  └─ 3de501fbbbb74ef1cc4fa00822cc3dca247413
│  │  ├─ 37
│  │  │  └─ ef6bcb9e18bcbc9dde3292f58e810e624cba30
│  │  ├─ 38
│  │  │  ├─ 92c5c98079c5e4ea4da4389ca743d2901fba8e
│  │  │  ├─ c4f10ed584ae755dc4b29f5fb7d0698a9593a1
│  │  │  └─ dc51b6686060006cbe4b3ed0a01c02b673c1db
│  │  ├─ 39
│  │  │  ├─ 44dd531505cbe33fced1c43c48046498d0a468
│  │  │  ├─ 843f8adffaa823542cb9987abde842ef634425
│  │  │  ├─ e6184b6ccaec02cc506ca06169741d025bce81
│  │  │  └─ eee3ea3eeb7b7c21836d98d9309ecac4e86b52
│  │  ├─ 3a
│  │  │  └─ 54862ab9739c48d63ff6ed42cfa7910c1e8bde
│  │  ├─ 3b
│  │  │  └─ f7a07ba2499fa12e284421982d78a3fea1df0c
│  │  ├─ 3c
│  │  │  ├─ 0af0724972cfa23da11ef1273245777a007e55
│  │  │  ├─ 10e2dc5eb9b36647497261b8404d51b50e8339
│  │  │  └─ fc6dcf160068fd0ba7adbd0b1ec1ab8b5c6cb9
│  │  ├─ 3d
│  │  │  ├─ 00861d73324dd2e70d6ae4a9de80c03c32d274
│  │  │  └─ bb3f0abfff9bf31dd5a6103bc54e374dccfd99
│  │  ├─ 3e
│  │  │  ├─ 71ba5b47b1191ee962a0f224870477d19ec215
│  │  │  └─ 7d493840125acd9adcc5177774e39fe0e3d445
│  │  ├─ 3f
│  │  │  ├─ 8de6024cf7a3543e52d4e187c9c4ea1ca85e02
│  │  │  ├─ ad1a0f90739d8f2ec8b475117caae26a4e46c5
│  │  │  └─ bb4605d15b6c0f16e99788ea8c6c4cd551aaba
│  │  ├─ 40
│  │  │  ├─ 43ac6c9b5a458227e723451c32ca1362427596
│  │  │  └─ 67d8fa248a5f06d08a7bc0b6445cbeb7811261
│  │  ├─ 42
│  │  │  ├─ adee9302a852bc9e1c26488ca728e7d43c8823
│  │  │  └─ ef2aaeaf887dc283524b60d58c09ce6d3843dd
│  │  ├─ 43
│  │  │  └─ b0f86a474c123030441c29ea74e6a5557dc71b
│  │  ├─ 44
│  │  │  └─ 086c619653f7a4acf58f65b856dbc169a33b75
│  │  ├─ 45
│  │  │  ├─ 10971adcd1c6bfac10d1036d1afdd720b078ac
│  │  │  ├─ 187ac1737c24b4509ee3d80372401f72eebc95
│  │  │  └─ de8a33366a4059853d9dda055b79bc84fc1465
│  │  ├─ 46
│  │  │  └─ d70f0dd2dadac60486b454c8f60ea667e0d4dc
│  │  ├─ 47
│  │  │  ├─ 3e4301c52b28d20009e61f8729cfb29edc963c
│  │  │  ├─ 7ee6ba110eeba7bd477a57aeb517dc84a2bf69
│  │  │  └─ bf66c8ef27b7ab780481cd9f8652ee0d1b4ee2
│  │  ├─ 49
│  │  │  └─ b258e92bfcf1d5239e717a90a695da067b266a
│  │  ├─ 4b
│  │  │  ├─ 30fd52437b5cd8cdd65e2da0b0e6519f8534eb
│  │  │  ├─ b16bc87047ad9cf4506950d36ef5503fd30bc9
│  │  │  ├─ c99a5bae554205e85b983f3bac68efe904a1bf
│  │  │  └─ ff1c4d5580c6f63fc7681c399d6c6527b2f95c
│  │  ├─ 4c
│  │  │  ├─ 939aff77f839e24ad227c53dea1d3d94846d30
│  │  │  ├─ c70061fe2d314fd61e97220d9f93eceae1cf6a
│  │  │  ├─ e9d10b880f92deed54eaa73f66d731d212cf4d
│  │  │  └─ f98bbabda3fb19e47954fdfffe947c38dd46ec
│  │  ├─ 4d
│  │  │  └─ 7f1e170d60d4ecafee23ee3eebb583fe09c0f1
│  │  ├─ 4e
│  │  │  ├─ 152c3b03af9d516e1dbfd9709be26f579f4ee9
│  │  │  ├─ 79812be2d66d4258972903f4d6eab077d95ddb
│  │  │  ├─ 926e92c88b182688b6f90867d55663616d0dae
│  │  │  └─ ffcf9c24a4f4c7b57aa83914b073869ff119b5
│  │  ├─ 4f
│  │  │  ├─ 4a0c2edf87c0546d20042ddb68ebcf458576c1
│  │  │  └─ 904a7639c0908715c9fd85f846cbff36b5fd47
│  │  ├─ 50
│  │  │  ├─ d3e0c72d2c786933d980e8c1a311ea2e01143e
│  │  │  └─ f1fb228bbb5d2e3ebeaa42eaf83cfcbf0869f5
│  │  ├─ 51
│  │  │  ├─ 1d0123907b05eaf9c1654b4ed721b3cb04731d
│  │  │  └─ dbb94b8f2ef1dc855d644b0ee669c07aa38b6a
│  │  ├─ 52
│  │  │  ├─ 92253ad514e8cdf4b437958c92ce287d24f292
│  │  │  └─ d5fd048ef356a10e336852a216c1b4f15887a7
│  │  ├─ 53
│  │  │  └─ 9b7d1d167651db3727fb8f029932b15f365bc8
│  │  ├─ 54
│  │  │  └─ 5e917f442a8ce475da9f52344249861163e00a
│  │  ├─ 55
│  │  │  ├─ 2a5467effc18d641d9d93f01551c75502e48bc
│  │  │  └─ d2cc276204c2f3b599ac937c2eba5c2190a4c8
│  │  ├─ 56
│  │  │  ├─ 024bd7960e582143bd37e52ac8e7e5ed889e1e
│  │  │  ├─ 1d86535bae9d8b381cee15b5d4160a4e74adaf
│  │  │  └─ 964375d10285879e4ba695f57ced493472621c
│  │  ├─ 57
│  │  │  ├─ 5055c889d392b8e37a3c61e4bbb970ed016e84
│  │  │  ├─ 6f2c56dc43afc6ed18057ec6ae480a8139017b
│  │  │  └─ d59bce86e128aecf66b55b3df1da3927f839b6
│  │  ├─ 58
│  │  │  └─ d14e1737c84351b9b604f4eee85418e98d817e
│  │  ├─ 59
│  │  │  ├─ 6c47fdd59aa703c65193f68da9be1c97b217e8
│  │  │  └─ 6e7bc030ecc7170156454baedd451edab063c4
│  │  ├─ 5b
│  │  │  └─ 4873b640656168ce9fae93ca38e792f017ce40
│  │  ├─ 5c
│  │  │  ├─ 594de66d605c1fb680467933c3624562ba4373
│  │  │  └─ e0028c6329c389b14ce8939adaab9126a5f21b
│  │  ├─ 5d
│  │  │  ├─ acbaf747f5bea5fe753f3d03bc205a76d94708
│  │  │  └─ fd3e134da8631e5a3984c9d2b65f20a3bf2d86
│  │  ├─ 5e
│  │  │  ├─ 0de5bdec569b9e0bdb53cecf649597aa664b60
│  │  │  ├─ 19d9618a0cd3508d1cfae7a2973b21efcff49b
│  │  │  ├─ 22a6243242a7349aad338b5b1aa17d3894a00d
│  │  │  ├─ 40b8a7a3d46de1d822f5affc4c9bc12af2e223
│  │  │  └─ 75e0bf29a38d8b166dc2688bf52f0b59965935
│  │  ├─ 5f
│  │  │  ├─ 10552aad583b4b104ad8790d317ec56defbb11
│  │  │  └─ 3e71a46336ade54b95dacb0c5189ee18862fbc
│  │  ├─ 60
│  │  │  ├─ 14a08439788ca17a6b392da7b3d7054db6609f
│  │  │  ├─ 326330e9f9ebaf9cdedebb3b040b400ad587d5
│  │  │  └─ d1016080b04d865429ca3883e33577c4e3976e
│  │  ├─ 61
│  │  │  └─ fe0378eecf35f634d17de592b775f7060c6d41
│  │  ├─ 62
│  │  │  ├─ 391e2884d0b66599008c7c4727417487653736
│  │  │  ├─ 538489c4724f744fe561b03fc0376dec122463
│  │  │  ├─ b1723610533e7f5507e02d31c380e1ef22f079
│  │  │  └─ c163242240555dd8cd075ea5554514ee006988
│  │  ├─ 64
│  │  │  └─ 8994ceb9df7b8e6d04d9e029ce249fe346e093
│  │  ├─ 65
│  │  │  └─ e8df8d9a02cb85d49d301b4b0aa7301357020c
│  │  ├─ 66
│  │  │  ├─ 1ddaec43d6bf38de9ff113352986f8563eddf4
│  │  │  └─ 780d899363f60069ca64c70e8a30b92e091ff9
│  │  ├─ 67
│  │  │  ├─ 35f31fd6e5f34e01aec9291bd1730ce3d0fcf0
│  │  │  └─ c63d24c370c1e076d87adca53e156afc21f55a
│  │  ├─ 6d
│  │  │  ├─ 44f123c827dab6d073613c47b1d8eaa261e44e
│  │  │  ├─ 7da6aef3f950a313481305da1c3711fe2d4416
│  │  │  ├─ cc7366fd128b5e0e3995248997f0d470f8d3dd
│  │  │  └─ e143c8d12793498f71438489a013c0eaa6323e
│  │  ├─ 6e
│  │  │  ├─ 201e271c7059b8015ea896e05525a84f6ab01f
│  │  │  ├─ 5dfdc1c9324f1c28574c5eebb0b718c2eb2e2a
│  │  │  └─ dd565d3ba2b3e78d0af902e0685576ee8cdf67
│  │  ├─ 6f
│  │  │  └─ 75a3f102755e48a145f929bdcc1b7768aa6840
│  │  ├─ 70
│  │  │  ├─ 0480a6df389a345b24f76a7789837c83c56064
│  │  │  ├─ 189726185515bad7885444c4f306d61a3704dc
│  │  │  ├─ 91abda25e19a8620b13f87d5a343aa6c499e3c
│  │  │  ├─ cb7ecaa3ea2b45ce32a28a60ce2666d7bedbb9
│  │  │  └─ d228b51ee12b31e016d71e8b88e3e6eb762176
│  │  ├─ 72
│  │  │  └─ c834075c117d0a7a85bc6723a4a592970ddc71
│  │  ├─ 73
│  │  │  ├─ 27fec98552a0540741df616167e0187a92ecf6
│  │  │  ├─ 6044def4c97b3cd1e1947c55ba19c3e463ab34
│  │  │  ├─ a2e419336bb7f8f4a4815eebd4058847db6b1e
│  │  │  └─ e6bb233f09eed081462ea092dedf00e0c65c3a
│  │  ├─ 74
│  │  │  ├─ 5821ea974339ee394a89d2717e449ac957bd12
│  │  │  ├─ 738df73f5d502baf89fb741b219634df2c932a
│  │  │  ├─ 888162174bcd5b6f90a5620642423e653a1149
│  │  │  └─ f2f28271cc7e80c82d1bda4e5d6ed266e95c0e
│  │  ├─ 75
│  │  │  ├─ 336b06ab32be1d70ae0d6a6749608d023fe842
│  │  │  └─ b3f60c9a8a5e18b38891a1560e304115b27d71
│  │  ├─ 76
│  │  │  └─ 2337561d326c8949278ef1b1c19d2a02245089
│  │  ├─ 77
│  │  │  ├─ bbb13dd49e27db3ab4a70f1aca6696ee8c734d
│  │  │  └─ d89acda3006aa635ac13dfd6562fa2743cb326
│  │  ├─ 78
│  │  │  ├─ 8d4e1212293d06c2fc241db709600b64340e4e
│  │  │  ├─ 9775bc128732081613bf70b37fdc3b2f0b6b34
│  │  │  ├─ e0ab610974563601ff74813f9c60c786ba0525
│  │  │  └─ e168828f8cf096de451faece0e8cb7ce7f71f3
│  │  ├─ 7a
│  │  │  ├─ 28eee33bd476bf2f72a71befccd3d3898fdaa3
│  │  │  ├─ 79b5b02b20c70dbbc6bdde14ae4cdda44fec9f
│  │  │  └─ e240d2f2e5490678a090591c279406b7942767
│  │  ├─ 7b
│  │  │  ├─ 1047726c9c69f52e37c9b54d689813357b8ee8
│  │  │  └─ 19d0eff34d17bb16f2b469cd2b14f5527b5819
│  │  ├─ 7c
│  │  │  ├─ 5a3efad84636a5e9cc9de5d3ae36abe03519a3
│  │  │  ├─ 922fa52d14819f779f7e5c370f36df798a5c2f
│  │  │  └─ ff55362a4fcd5b81162fc891958a377c9b4f44
│  │  ├─ 7d
│  │  │  ├─ 21495b334ae238f2785031eea8326a89afa32d
│  │  │  └─ c2fcdd6d0dbaee3992c41d8057a1de5f41bbf9
│  │  ├─ 7f
│  │  │  └─ d00c64f1ae34b9dfb947f6951f2f2b8d16d904
│  │  ├─ 80
│  │  │  └─ d24ffa4851467996513e6c7741164ff3bc2c48
│  │  ├─ 81
│  │  │  └─ 8a65496c04b204202583d6444996f12c0afe09
│  │  ├─ 82
│  │  │  ├─ 92c14862d3c70336aeb36e622eeeb78391cbda
│  │  │  ├─ e51c276c3347fcb025ce074bb3fad53ae3160b
│  │  │  └─ f40d046acf2653f828c0b142e5832af4666048
│  │  ├─ 83
│  │  │  ├─ a13930f3b395c47860338071871e0efd70163f
│  │  │  └─ b8ee7d83ec4c94e1280d8d3f8d81942c8af5a4
│  │  ├─ 85
│  │  │  ├─ 454a9f37e4e70463dd29049b4bed18130b72b4
│  │  │  ├─ a951238ec696e531d44e1b7217dc91663f00e7
│  │  │  └─ e667bb861ca87a82c23d285b16ac737955f18c
│  │  ├─ 87
│  │  │  ├─ 4dd85bcbc4b15d7ecb0ce717788f605007aa39
│  │  │  └─ 7da4b1e98c2b39d9f22c21c67f313c230ef382
│  │  ├─ 89
│  │  │  └─ a8381e7e4b0459ca2dce8b500a67d2fffa8561
│  │  ├─ 8a
│  │  │  ├─ c0dacd4cd230c9be414805cc4a662ac0dcdeef
│  │  │  └─ e9ff34cbc974b53d0b736758f08849b70048af
│  │  ├─ 8c
│  │  │  ├─ 76da5abd90a691a27d9aa004827ba1a3342bb4
│  │  │  ├─ e41809fa5002c7fe5d343554123429b59ee809
│  │  │  └─ e9aed839810fb7b66cf495ea93da47a7825cb1
│  │  ├─ 8d
│  │  │  └─ 09a802232d25b70e334b8c0b6b17d677e23063
│  │  ├─ 8e
│  │  │  ├─ 43a68d87789d5be2b288b496a5fee907c97e90
│  │  │  ├─ 5ca4443d0c4df2892389dd30b2adb3fb15eeea
│  │  │  └─ 9c69f98e01f2896b175df896b0c8d0ed17fe09
│  │  ├─ 8f
│  │  │  └─ 96330e4869ae2f45de8eaf664d6fd89b2198e1
│  │  ├─ 90
│  │  │  ├─ d97d5a0956004d0880e5d6123e21e6c5cddf26
│  │  │  └─ f4454c98ed0939898bc2a99cfe30795a3b6aac
│  │  ├─ 91
│  │  │  ├─ 774ba1533034b0e7b761e16995e0b9e36495b9
│  │  │  └─ d37c8b3da7a65ddfeb8d5aa5f0f5cbd211602f
│  │  ├─ 92
│  │  │  ├─ a1579b7e70f46870c288b660fd67746e2bc6d0
│  │  │  └─ d8151b33455e850e1ad83107c7df772cfc1fe4
│  │  ├─ 93
│  │  │  └─ 764a5fea5f84405ff440ef930b1ed7c25d4268
│  │  ├─ 95
│  │  │  └─ 900a08cc5fade5f459951472bee0f53a970ce8
│  │  ├─ 96
│  │  │  ├─ 04ba3f0f7f9bad6d23f03f8ac5bfc75ef21c1f
│  │  │  └─ 3625de8a9e708a0d644da812a0cdc14249ae4d
│  │  ├─ 97
│  │  │  ├─ 27962ef1a4666656c00e4ddf97fd94166f69c7
│  │  │  └─ 912f8bc4ff9d493af74d240767f50ec3569168
│  │  ├─ 99
│  │  │  └─ e27c2d2192ea8fac31069aba8d4bc27f2617c9
│  │  ├─ 9a
│  │  │  ├─ c067da3f259e14b67945f6807477b60d57d32e
│  │  │  └─ e0a5e1f5cae74210f6ce28dca475ca411638e7
│  │  ├─ 9b
│  │  │  └─ 5f148cc3f896c986c0d7c2ff8f9314515d139b
│  │  ├─ 9c
│  │  │  ├─ 50898ac910d117593a3233e68873e6bd324608
│  │  │  └─ 6a24f82337651d56f4f9b87489fb08f8cecc27
│  │  ├─ 9e
│  │  │  ├─ 84d3c802a2102bf9d3837efa5c163cb321c5e8
│  │  │  └─ 90200fd0b4ac4382784d822ff785462db7e153
│  │  ├─ 9f
│  │  │  ├─ 30297709c83c0ad0d237f165344f0f5a249831
│  │  │  ├─ 391e484da2456158a688b722ccd360064f3b48
│  │  │  └─ 5b2bf549eb4b8136074c9faa421065a80ab986
│  │  ├─ a1
│  │  │  ├─ 2e6ccba739e781fe5d9228e2acb84becf8a7d9
│  │  │  ├─ 38edc4acaf689d307b939a768dbcdbdd891986
│  │  │  └─ 9ac53f03679700ea91c6ce767ac65ad973851d
│  │  ├─ a3
│  │  │  ├─ 07a842ced196e62700c33a31234f45b1fea06e
│  │  │  └─ 3822dfd3e8bb84a243d41788df541d546445ed
│  │  ├─ a4
│  │  │  └─ ec2488d256644fb43b6d763b5895e03735323d
│  │  ├─ a5
│  │  │  ├─ 37762a9c1bad67911dd2019892dd14df87b0f5
│  │  │  ├─ 586fe4796c42c3e9f0017fae9a5246a36d8a48
│  │  │  └─ c202508750f91193f6e564ebaa2fb822337ac2
│  │  ├─ a6
│  │  │  ├─ 3f5140d5c512521903a6acef8977a145906cf6
│  │  │  ├─ 48646090c4a887447ff49653f42906c5c9aee4
│  │  │  ├─ 5e2799e1c50893efea1dc879cba8e3048971a0
│  │  │  └─ 881abf2b0c7adaf6bbb783343d19b1723a06e0
│  │  ├─ a7
│  │  │  ├─ 1df62938b567ce7a0104f4d3de915274c0c953
│  │  │  └─ 68ae6debadf75d9edf6f978f6e718fde733f50
│  │  ├─ a8
│  │  │  ├─ 35ac2a88f358ca62b07d6ea0c4406057f6398a
│  │  │  └─ f069cf9583bcd5a716ce089f1d970eaeae93ec
│  │  ├─ aa
│  │  │  ├─ 053d0bd0ca9f966d81c10063da064552c5efca
│  │  │  ├─ 6c3822f1afbf8f0b1dc2959e64869319c67392
│  │  │  ├─ 7ff29d294238660caf9dbba2d23b8e5818e168
│  │  │  └─ e1e5a0e956899115174ebe298e7d152a399ff7
│  │  ├─ ab
│  │  │  ├─ 73b1ed46ad149eb753cc7851dee390c2171f13
│  │  │  ├─ 80430f48ccf6f1639c0310007620b320f71594
│  │  │  └─ e037fb1a842dbec92d252bd3d75bf04fd547d9
│  │  ├─ ac
│  │  │  └─ f819143a059b93f8e13d5c6548830a7d58e446
│  │  ├─ ad
│  │  │  ├─ 85c2902cbec651948fde743920674563c3c235
│  │  │  └─ 8b209d326bb51fd76b8027f643f98f096a675a
│  │  ├─ af
│  │  │  ├─ 0032c68b2db9048a44c5a2170a8b44a49e757a
│  │  │  └─ 74a266a2f970296fd8923d349d98291e527fcb
│  │  ├─ b0
│  │  │  ├─ 92d2df1d995dc857d7fc33ae023e1056ac9129
│  │  │  └─ b2989ed4192c74d98154458fbf608f1377b05e
│  │  ├─ b1
│  │  │  ├─ 21279e55d1534108b007fd15fa089599710950
│  │  │  ├─ 65a4706fe2bdd2f1631d253481a6c48151b645
│  │  │  ├─ 67d89a30588b53a7ae019dcfa00b827b15a09b
│  │  │  └─ d5ada3ca2fef1f4d1eb5638bafbb645cd11530
│  │  ├─ b3
│  │  │  ├─ 1abb0653565e1ad708b8fbb5314d5f27693e71
│  │  │  ├─ 26d5e46dcfd9870e5abff971b8d135adb88ebf
│  │  │  ├─ 2767c29f8e3af2701e8452213b902243eec758
│  │  │  ├─ 5031e2d2a1bbc5d312fa87549eacc6a6c49761
│  │  │  ├─ a0b062dc2011e44fa565b607e28452ff4a85e2
│  │  │  ├─ ad2af2c0669450ec268df48a2295d13eef5009
│  │  │  └─ ee1618f549840d3eeaff6c94dab3ba0eb2346e
│  │  ├─ b4
│  │  │  └─ 5220d7c132a6fd97dc26dd7dfd6ba3c2d3d954
│  │  ├─ b5
│  │  │  ├─ 4d349c032545222c4eb3b94ca1c2e2f10300f3
│  │  │  ├─ 94407b7ba3ab9ba9d5242187bb56c2714a8b50
│  │  │  └─ e61bb500f003cb7d2c5121a1c3dc04e3d0cc03
│  │  ├─ b7
│  │  │  ├─ 2e3a6db6f6b163d3f12555d52ea4d5a56f44d0
│  │  │  ├─ 49b27d2d1970204f2890a3b56436ce6a6bca22
│  │  │  ├─ a5e26419dcbd1f56dee821978cd5698f2057bc
│  │  │  ├─ c20f72b31a22c2832929a8a1b9b17106ac33d6
│  │  │  └─ f62fa13871058edcfc4cb798c534e3c4b07d56
│  │  ├─ b9
│  │  │  ├─ 9acdc6a3f027addbdc78fcb07c3f145a942bc9
│  │  │  ├─ a27b60108b94e946f4cdf68eee437bc2a6ba20
│  │  │  └─ ff84d6272eac8fadcc8c566ab8d6632fdfcc8d
│  │  ├─ ba
│  │  │  ├─ 43d6e32bc200bacccd39e7a22927f5004d5e8f
│  │  │  ├─ 525f5d5397268758e8d25403ed04e5826c14b1
│  │  │  └─ 9c6e00e226e200d3fdcf2c826c62f7824601e4
│  │  ├─ bb
│  │  │  ├─ 10c7e4a3259fa5359284642954bef0901de706
│  │  │  ├─ 5accdf49ea309dfb18cd2a334fa1f1e9e29295
│  │  │  └─ 794d23530a3614c9cc310407f7c3a73d709696
│  │  ├─ bc
│  │  │  ├─ 3c8e963d31c96001e04a5386a6357cc3be4e94
│  │  │  ├─ 4dd13726c1dc8804896a1c78b1e81a07b551e4
│  │  │  ├─ 646e112cf0a6484b9248193eed42c3a238ef67
│  │  │  └─ 8fa86c66d53a857d13810897f7305f3b803b2a
│  │  ├─ bd
│  │  │  ├─ 61623cbf8afa60642695ed1b9b7a66133ef1ab
│  │  │  └─ 9f711062fd230acca92c9dab7cf22c5596c482
│  │  ├─ be
│  │  │  └─ 2510bec4a58c3fec17563de172ad59dce6b809
│  │  ├─ bf
│  │  │  ├─ 2bd32c708ae837d4ffa8b809b398ca69e211d9
│  │  │  ├─ 54e49710354748930e369691b176ab72bec7fa
│  │  │  └─ a23a4521cadb77ccafb1598fb94f8f1bea75ef
│  │  ├─ c0
│  │  │  └─ fdd1b4bb6e15085f7d71063aa879f14382c6a0
│  │  ├─ c1
│  │  │  └─ d4d21eef006f3c0a155f58b64902793761575f
│  │  ├─ c2
│  │  │  ├─ 20811dacb9f4eb0ba054939d448fcc66398e58
│  │  │  └─ fa96136b1a6a967df69266064ccdee3b38949f
│  │  ├─ c5
│  │  │  ├─ 161842a175b4a79b157c7b13064b603011b094
│  │  │  ├─ 661560bbd2e7a028591924e231a81aeb488d90
│  │  │  └─ efc2c7935befa5c73821aaa4ee2e81ea8cc078
│  │  ├─ c6
│  │  │  └─ 1ea214f5f7373ee9b1956004ff11d606e4541b
│  │  ├─ c8
│  │  │  ├─ 7ca633a3d15078e6404a7afc7b00c3ff0afcb8
│  │  │  └─ d6352b44df7a92d701bfb83dc1848423fa092e
│  │  ├─ c9
│  │  │  ├─ 37b0293e7056e67343b9a6474f3048a89a53e6
│  │  │  └─ facd1d1f42c8686646645074b720c7703b0866
│  │  ├─ ca
│  │  │  ├─ cf0e1e620035021b623a35e41d29e728922f3b
│  │  │  └─ d21ca5d15a90219d51a66f26c757018267a210
│  │  ├─ cb
│  │  │  └─ cfcf6e8d14dd6eceb00baf1de5f8b7fd0acf88
│  │  ├─ cc
│  │  │  └─ 49635cbc7d96912e41fa405234e6f276b88c41
│  │  ├─ cd
│  │  │  └─ c6d90d41e07a3ff82c1de02f7666cd9723a913
│  │  ├─ ce
│  │  │  ├─ 2958d6b1adacd4826daf4eb817a86352314545
│  │  │  ├─ ae0cefa9124c3c812360cdf5c2eae3971a5b30
│  │  │  ├─ cde3b1856e53d0d011d3147dfbbe7b1761bf72
│  │  │  └─ e4a1c2fce7b65deacbccd100cfd6890e2459c7
│  │  ├─ cf
│  │  │  └─ 37cc174f0a4a40fc6baf3f1947bcf75f1c9b67
│  │  ├─ d0
│  │  │  ├─ 2fa01f35beae8aca39258e900723db67deafb7
│  │  │  ├─ b23bf87317a51536603ad18bd0d2be66c44fba
│  │  │  └─ c43d7a96d2212a78af7bef87fb766ea202af3e
│  │  ├─ d1
│  │  │  └─ 9df0d26f4886260fcb1b725318ea92a724093f
│  │  ├─ d2
│  │  │  ├─ 16de1fc860ca9436cd20b2350d63a5eb104962
│  │  │  ├─ 7dc09e20fbd86577804aae2450de49a85079d8
│  │  │  └─ e9cd0af6f5ebbfc8b7e9dd8d51f24cb3d720c3
│  │  ├─ d3
│  │  │  ├─ 7d4c2826582a90f5c280f9891a13eafcd13654
│  │  │  ├─ c7a1ef29fea2873b8123c5b9748d6c53ae77f7
│  │  │  └─ eba3083666ef57312c565f5477dce229ea3c1f
│  │  ├─ d4
│  │  │  ├─ 514126ffd5442c9b74530f85f0bfdc37fa0853
│  │  │  └─ a8848ecd7c3155ac5f87a2d4ec2fb78e60a658
│  │  ├─ d5
│  │  │  └─ d21ac47b8c85922b0d6d5c8aa54da4a6414e2e
│  │  ├─ d7
│  │  │  ├─ 3b32eec5e8ebc7e93d7056076053f0a0bba711
│  │  │  └─ d35a8a4eeb135203822759e4e4bbf94c1ad812
│  │  ├─ d8
│  │  │  ├─ 43da67116c3fb6131e297b389006de25b7cf01
│  │  │  └─ c554fa9871d809b53ce7ba4a2ce3d2a2e86ade
│  │  ├─ d9
│  │  │  └─ baf386db488df12d161fac43349256f6ecf426
│  │  ├─ da
│  │  │  └─ e3aabcd5b1da2665cd9388da55d78b891593ad
│  │  ├─ db
│  │  │  ├─ 4323500416a00e5eb80ff8e3e8e4db8a01c1da
│  │  │  └─ 58fb4084b7d01c13ac4a65c062ff41d2e537b9
│  │  ├─ dc
│  │  │  └─ 8f97a75088469a5b221e140d987254ce3a7227
│  │  ├─ de
│  │  │  └─ e74385b0346501660172f06f13b0de68f9c1e1
│  │  ├─ df
│  │  │  └─ 7b77a69d1dcdf280331c98e807a1f509fa33f2
│  │  ├─ e0
│  │  │  ├─ 520c13a54e19b41e0166fc469144c7a0358e94
│  │  │  └─ c97f989d5baa3121abb72034a3f5b218076605
│  │  ├─ e1
│  │  │  ├─ 0fe4395dc6387f92a021b268e4820f05fee8f0
│  │  │  ├─ cd8f3e545fe576afde298ab49e5c0b81ad0b5a
│  │  │  └─ d5762d9cb421b4c988191c78a892f9032128b5
│  │  ├─ e2
│  │  │  ├─ 1997fcc0d1a228409dde482dcb091d99141d3f
│  │  │  ├─ 6965bee7ebc5cf2ffb7ed7fe717b303ef1710f
│  │  │  └─ c534fa26e61dcfc05cd2a1b3d840931727ec33
│  │  ├─ e3
│  │  │  └─ 1d456bbd1a2ef6c730163e892f34c8774e25ae
│  │  ├─ e4
│  │  │  ├─ ad1733a7efbb5f39ace34ba0eb7d8d5c90673c
│  │  │  └─ fd8369b3138d82653996b3496de8def3fcdf03
│  │  ├─ e5
│  │  │  ├─ 890264922ba70c0599ac4a2dea56b853848238
│  │  │  ├─ cb47ddc9efc4838bf7799d94b58820e04556e8
│  │  │  └─ d9b3580115ff4f8959dba3c34be9806f9a29e8
│  │  ├─ e6
│  │  │  ├─ 02e16cfebbacb339fb0433184e119ea5929b65
│  │  │  ├─ 9de29bb2d1d6434b8b29ae775ad8c2e48c5391
│  │  │  ├─ d9fa364ddf7442f92d4d1b8eda050e5d2a0173
│  │  │  └─ e6515e50952f3cc0a48e7b1b7aef56f7350790
│  │  ├─ e8
│  │  │  ├─ 6e848861ca53a4843d621cc4362e06afc7cb0f
│  │  │  └─ d349ff7ddbed88da2c841e75356a623af6c828
│  │  ├─ e9
│  │  │  ├─ a58d2806ab36c687f9181d1190cb3fc9ca675f
│  │  │  └─ d4e74e7cc34d57a4e089238fb517b7e6e7431a
│  │  ├─ ea
│  │  │  ├─ cae3abb63915fe6ab5d8a59f912427d39973bb
│  │  │  ├─ e7983b6a54fe0aa41e539ff7dcdc977a3f1213
│  │  │  ├─ e8dc344471f5489dcd09c96708338115b65b4b
│  │  │  └─ feaaee670485257ac0b17636ab3992b8c16816
│  │  ├─ eb
│  │  │  ├─ 1b94457909f72e4ab04eb18250bd6437443d15
│  │  │  ├─ 35b20df56ff0e24705e1f4f948cfd26055f119
│  │  │  └─ 74f06baa913c091ea9828f86f0f45309346faa
│  │  ├─ ee
│  │  │  ├─ 05cbf730f72fd8d65b85e5526d96cb67f2c6fe
│  │  │  ├─ 1874477654ce5467847255c33aeef5e2ed9f24
│  │  │  └─ 5f491eab17aa23bee9f5ae8b1e5f3fa6ef6470
│  │  ├─ f0
│  │  │  ├─ 01ba7f6a8dd4130280f57e5f7a31b4fdf09bdf
│  │  │  ├─ b729ba4a8499f30ecb52db3acaf2456c716496
│  │  │  ├─ ef3ce814cd430112e14764a5d0f38f12cb7995
│  │  │  └─ fb80d0933e0cb3c29052bbcc19cb83371112ee
│  │  ├─ f1
│  │  │  └─ 8c849496eb90ea6778db368f0ea66e3f6fd0f0
│  │  ├─ f3
│  │  │  ├─ 5bc04f3d414b5e8e3917add9e58bf6f974166b
│  │  │  └─ eb85d039771a07b6b82ce93f310f91ae85e324
│  │  ├─ f5
│  │  │  └─ 9c8765e2856eb46d833d69cae9642aac70b13d
│  │  ├─ f6
│  │  │  ├─ 1441494c2aedf3ce1534e96fd3b19ff8f86ff1
│  │  │  └─ 5fbeb8c6ead8b7e615eae57a07e964f46b0d6e
│  │  ├─ f7
│  │  │  ├─ 1efdb2720611488dca79acaabfe7fa144c9989
│  │  │  ├─ 234ca7ec6fc2e5dd8b270571065fcabe443f8a
│  │  │  ├─ 642d745d02cbdd058ee22162d829bc68af1347
│  │  │  └─ e1737e717290d548fed6f5e76085cb67da5646
│  │  ├─ f8
│  │  │  └─ c957c921ddaf7cb68d18b1aa64c86e4ba48496
│  │  ├─ f9
│  │  │  └─ 3ca8e90459a2bbaa5f717b52d0aaf9c3d11b08
│  │  ├─ fa
│  │  │  ├─ 55c0dd539c79a547b8a313e1d7d65150424aac
│  │  │  └─ b0b1c8f74d4ae332047155d695775557e2e721
│  │  ├─ fb
│  │  │  ├─ 04e30e15989994dff81881b3f701a84c1adbd2
│  │  │  ├─ 342c9e2cf66fceca141f365deb1e8389a46e03
│  │  │  ├─ 6062eedf89760e6a7737e7d5d611b068647ba4
│  │  │  └─ 8fe56c0aeda552ddadf4a896c059469f8d67b0
│  │  ├─ fc
│  │  │  └─ a8c909eebef9491a774ba8f1d115018f262589
│  │  ├─ fd
│  │  │  ├─ 2f1016408ebfdda354657593c46a4fb9b382a7
│  │  │  └─ db4e2f84b5c7080afc595ea380fd3e9092a218
│  │  ├─ fe
│  │  │  ├─ 01f70e5bb5662f85dc045eaf1f639391634be8
│  │  │  ├─ b0c1ab688d0077efcd326c244fc3aa1badeb2d
│  │  │  └─ daff22680b2259cebc9b8964dd2a63a15f0d09
│  │  ├─ ff
│  │  │  └─ 979db186157d09ec382cf11d972e6160335bc7
│  │  ├─ info
│  │  └─ pack
│  │     ├─ pack-72bd114c2cc452140640a97c22789ff78d3d327d.idx
│  │     ├─ pack-72bd114c2cc452140640a97c22789ff78d3d327d.pack
│  │     └─ pack-72bd114c2cc452140640a97c22789ff78d3d327d.rev
│  ├─ ORIG_HEAD
│  ├─ packed-refs
│  └─ refs
│     ├─ heads
│     │  ├─ backup-2025-22-01
│     │  ├─ backup-before-clear-crash
│     │  ├─ flash-history-clear
│     │  ├─ main
│     │  ├─ new-search-dom-fix
│     │  └─ roo-code-flashy
│     ├─ remotes
│     │  └─ origin
│     │     ├─ backup-2025-22-01
│     │     ├─ backup-before-clear-crash
│     │     ├─ flash-history-clear
│     │     ├─ HEAD
│     │     ├─ main
│     │     ├─ new-search-dom-fix
│     │     └─ roo-code-flashy
│     └─ tags
├─ .gitattributes
├─ .github
│  └─ copilot-instructions.md
├─ .gitignore
├─ bun.lockb
├─ bunfig.toml
├─ components.json
├─ curl.png
├─ eslint.config.js
├─ index.html
├─ java.png
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
│  ├─ favicon.ico
│  ├─ placeholder.svg
│  ├─ terminal-anime.gif
│  ├─ terminal-ezgif.com-video-to-gif-converter.gif
│  └─ terminal-screenshot.png
├─ python.png
├─ README.md
├─ src
│  ├─ App.css
│  ├─ App.tsx
│  ├─ components
│  │  ├─ Terminal
│  │  │  ├─ config
│  │  │  │  └─ terminalConfig.ts
│  │  │  ├─ demo
│  │  │  │  ├─ 1-search-highlight-from-Claude.tsx
│  │  │  │  ├─ search-highlight-0.tsx
│  │  │  │  ├─ search-highlight-component.tsx
│  │  │  │  └─ search-highlight-V-4.tsx
│  │  │  ├─ server
│  │  │  │  ├─ commandService.ts
│  │  │  │  └─ index.ts
│  │  │  ├─ services
│  │  │  │  ├─ customCommands.ts
│  │  │  │  └─ terminalApi.ts
│  │  │  ├─ styles
│  │  │  │  └─ terminal.css
│  │  │  ├─ Terminal.tsx
│  │  │  ├─ terminalAddons-OLD-SEARCH-REFERENCEa.tsx
│  │  │  ├─ terminalAddons.tsx
│  │  │  ├─ TerminalUI.tsx
│  │  │  └─ utils
│  │  │     ├─ osCommands.ts
│  │  │     ├─ pathUtils.ts
│  │  │     ├─ terminalFormatters.ts
│  │  │     ├─ terminalUtils.ts
│  │  │     ├─ useTerminalExecutor.ts
│  │  │     └─ useTerminalUpdate.ts
│  │  └─ ui
│  │     ├─ accordion.tsx
│  │     ├─ alert-dialog.tsx
│  │     ├─ alert.tsx
│  │     ├─ aspect-ratio.tsx
│  │     ├─ avatar.tsx
│  │     ├─ badge.tsx
│  │     ├─ breadcrumb.tsx
│  │     ├─ button.tsx
│  │     ├─ calendar.tsx
│  │     ├─ card.tsx
│  │     ├─ carousel.tsx
│  │     ├─ chart.tsx
│  │     ├─ checkbox.tsx
│  │     ├─ collapsible.tsx
│  │     ├─ command.tsx
│  │     ├─ context-menu.tsx
│  │     ├─ dialog.tsx
│  │     ├─ drawer.tsx
│  │     ├─ dropdown-menu.tsx
│  │     ├─ form.tsx
│  │     ├─ hover-card.tsx
│  │     ├─ input-otp.tsx
│  │     ├─ input.tsx
│  │     ├─ label.tsx
│  │     ├─ menubar.tsx
│  │     ├─ navigation-menu.tsx
│  │     ├─ pagination.tsx
│  │     ├─ popover.tsx
│  │     ├─ progress.tsx
│  │     ├─ radio-group.tsx
│  │     ├─ resizable.tsx
│  │     ├─ scroll-area.tsx
│  │     ├─ select.tsx
│  │     ├─ separator.tsx
│  │     ├─ sheet.tsx
│  │     ├─ sidebar.tsx
│  │     ├─ skeleton.tsx
│  │     ├─ slider.tsx
│  │     ├─ sonner.tsx
│  │     ├─ switch.tsx
│  │     ├─ table.tsx
│  │     ├─ tabs.tsx
│  │     ├─ textarea.tsx
│  │     ├─ toast.tsx
│  │     ├─ toaster.tsx
│  │     ├─ toggle-group.tsx
│  │     ├─ toggle.tsx
│  │     ├─ tooltip.tsx
│  │     └─ use-toast.ts
│  ├─ hooks
│  │  ├─ use-mobile.tsx
│  │  └─ use-toast.ts
│  ├─ index.css
│  ├─ lib
│  │  └─ utils.ts
│  ├─ main.tsx
│  ├─ pages
│  │  └─ Index.tsx
│  ├─ types
│  │  └─ env.d.ts
│  ├─ utils
│  └─ vite-env.d.ts
├─ tailwind.config.ts
├─ tailwind.configSimple.ts
├─ tailwindPadDeRapport.config.js
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ tsconfig.server.json
├─ vite.config.ts
└─ vite.server.config.ts

```