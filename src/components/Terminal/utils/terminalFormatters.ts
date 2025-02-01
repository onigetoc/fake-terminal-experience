import React from 'react';

interface CommandProps {
  command: string;
  className?: string;
}

const CommandPart: React.FC<CommandProps> = ({ command, className }) => {
  return React.createElement('span', { className }, command);
};

export const formatCommand = (command: string): React.ReactElement => {
  const words = command.split(' ');
  const firstWord = words[0];
  const rest = command.slice(firstWord.length);
  
  const paramRegex = /(\s-[a-zA-Z]+|\s--[a-zA-Z-]+)|("[^"]*")|('[^']*')/g;
  const parts = rest.split(paramRegex).filter(Boolean);
  const matches = rest.match(paramRegex) || [];
  
  const formattedParts = [];
  let currentIndex = 0;

  // Add first word
  formattedParts.push(
    React.createElement(CommandPart, {
      key: 'first-word',
      command: firstWord,
      className: 'text-yellow-300'
    })
  );

  // Add rest of the parts
  parts.forEach((part, index) => {
    if (part) {
      formattedParts.push(
        React.createElement(CommandPart, {
          key: `text-${index}`,
          command: part,
          className: 'terminal-command'
        })
      );
    }
    if (matches[currentIndex]) {
      formattedParts.push(
        React.createElement(CommandPart, {
          key: `param-${index}`,
          command: matches[currentIndex],
          className: matches[currentIndex].startsWith(' -') ? 'text-gray-400' : 'text-[#3b8eea]'
        })
      );
      currentIndex++;
    }
  });

  return React.createElement('div', { className: 'terminal-command' }, formattedParts);
};

export const formatOutput = (output: string): React.ReactElement => {
  return React.createElement('pre', {
    className: 'whitespace-pre-wrap break-words font-mono'
  }, output);
};

export const parseAnsiColor = (text: string): React.ReactElement[] => {
  const colorMap: Record<string, string> = {
    '31': 'text-red-500',
    '32': 'text-green-500',
    '33': 'text-yellow-500',
    '34': 'text-blue-500',
    '35': 'text-purple-500',
    '36': 'text-cyan-500',
    '37': 'text-gray-100',
    '90': 'text-gray-500',
    '0': '',
    '39': 'text-gray-300'
  };

  const parts = text.split(/\[(\d+(?:;\d+)*)?m/);
  const elements: React.ReactElement[] = [];
  let currentClass = '';

  parts.forEach((part, index) => {
    if (index % 2 === 0 && part) {
      elements.push(
        React.createElement('span', {
          key: `part-${index}`,
          className: currentClass
        }, part)
      );
    } else if (part) {
      currentClass = colorMap[part] || currentClass;
    }
  });

  return elements;
};
