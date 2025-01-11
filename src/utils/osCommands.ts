type OsType = 'windows' | 'macos' | 'linux';
type CommandMapping = Record<string, Record<OsType, string>>;

export const commandMap: CommandMapping = {
  'type': {
    'windows': 'type',
    'macos': 'cat',
    'linux': 'cat'
  },
  'cat': {
    'windows': 'type',
    'macos': 'cat',
    'linux': 'cat'
  },
  'fc': {
    'windows': 'fc', // Retour à fc sans paramètres
    'macos': 'diff',
    'linux': 'diff'
  },
  'diff': {
    'windows': 'fc', // Retour à fc sans paramètres
    'macos': 'diff',
    'linux': 'diff'
  },
  'dir': {
    'windows': 'dir',
    'macos': 'ls',
    'linux': 'ls'
  },
  'ls': {
    'windows': 'dir',
    'macos': 'ls',
    'linux': 'ls'
  },
  'cd': {
    'windows': 'cd',
    'macos': 'cd',
    'linux': 'cd'
  },
  'pwd': {
    'windows': 'cd',
    'macos': 'pwd',
    'linux': 'pwd'
  },
  'explorer': {
    'windows': 'explorer',
    'macos': 'open',
    'linux': 'open'
  },
  'open': {
    'windows': 'explorer',
    'macos': 'open',
    'linux': 'open'
  },
  'del': {
    'windows': 'del',
    'macos': 'rm',
    'linux': 'rm'
  },
  'rm': {
    'windows': 'del',
    'macos': 'rm',
    'linux': 'rm'
  },
  'copy': {
    'windows': 'copy',
    'macos': 'cp',
    'linux': 'cp'
  },
  'cp': {
    'windows': 'copy',
    'macos': 'cp',
    'linux': 'cp'
  },
  'move': {
    'windows': 'move',
    'macos': 'mv',
    'linux': 'mv'
  },
  'mv': {
    'windows': 'move',
    'macos': 'mv',
    'linux': 'mv'
  },
  'ren': {
    'windows': 'ren',
    'macos': 'mv',
    'linux': 'mv'
  },
  'cls': {
    'windows': 'cls',
    'macos': 'clear',
    'linux': 'clear'
  },
  'clear': {
    'windows': 'cls',
    'macos': 'clear',
    'linux': 'clear'
  },
  'findstr': {
    'windows': 'findstr',
    'macos': 'grep',
    'linux': 'grep'
  },
  'grep': {
    'windows': 'findstr',
    'macos': 'grep',
    'linux': 'grep'
  },
  'fsutil': {
    'windows': 'fsutil volume diskfree',
    'macos': 'df',
    'linux': 'df'
  },
  'df': {
    'windows': 'fsutil volume diskfree',
    'macos': 'df',
    'linux': 'df'
  },
  'tasklist': {
    'windows': 'tasklist',
    'macos': 'ps',
    'linux': 'ps'
  },
  'ps': {
    'windows': 'tasklist',
    'macos': 'ps',
    'linux': 'ps'
  },
  'taskkill': {
    'windows': 'taskkill',
    'macos': 'kill',
    'linux': 'kill'
  },
  'kill': {
    'windows': 'taskkill',
    'macos': 'kill',
    'linux': 'kill'
  },
  'touch': {
    'windows': 'echo.>',
    'macos': 'touch',
    'linux': 'touch'
  },
  'echo.>': {
    'windows': 'echo.>',
    'macos': 'touch',
    'linux': 'touch'
  }
};

export function getOsType(): OsType {
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('mac')) return 'macos';
  if (userAgent.includes('linux')) return 'linux';
  return 'windows'; // Fallback to Windows
}

export function translateCommand(command: string): string {
  const os = getOsType();
  const words = command.split(' ');
  const baseCommand = words[0].toLowerCase();

  // Chercher si la commande existe dans notre mapping
  const commandEntry = Object.entries(commandMap).find(([key, value]) => {
    // Vérifier si la commande correspond à n'importe quelle variante pour n'importe quel OS
    return key === baseCommand || Object.values(value).includes(baseCommand);
  });

  if (commandEntry) {
    const [originalCmd, mapping] = commandEntry;
    const translatedBase = mapping[os];
    words[0] = translatedBase;
    return words.join(' ');
  }

  return command; // Retourner la commande originale si pas de traduction
}

export function shouldTranslateCommand(command: string): boolean {
  const baseCommand = command.split(' ')[0].toLowerCase();
  
  // Vérifier si la commande existe soit comme clé, soit comme valeur dans le mapping
  return Object.entries(commandMap).some(([key, value]) => {
    return key === baseCommand || Object.values(value).includes(baseCommand);
  });
}
