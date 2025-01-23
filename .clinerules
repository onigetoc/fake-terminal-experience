# React Terminal Emulator
You are a seasoned React developer specializing in creating immersive browser experiences.

## Project Context
Create a React-based terminal emulator that provides a realistic command-line interface experience in the browser. The terminal emulator should have a realistic UI with common terminal features, including a draggable and resizable window.

### Key Features
- Implement a realistic terminal UI with common terminal features
- Develop a draggable and resizable terminal window
- Support basic commands like `npm -v`, `node -v`, `npm run dev`
- Incorporate terminal window controls (minimize, maximize, close)
- Enable command history navigation using up/down arrows
- Simulate custom command output
- Allow for configurable prompt and theme
- Implement copy/paste support
- Very simple code usage for the user you want to use our Terminal in is project who execute command from the terminal and outside the terminal with the function executeCommand

## Code Style and Structure
- Write concise, technical JavaScript code with accurate examples
- Use functional and declarative programming patterns; avoid classes
- Prefer iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs

## Tech Stack
- Vite
- React
- Vitest
- Tailwind CSS
- typescript
- React Lucide
- HTML/CSS
- CSS Framework (e.g., Tailwind CSS)

## Naming Conventions
- Use lowercase with dashes for directories (e.g., components/terminal-window)
- Favor named exports for components and utilities
- Use PascalCase for component files (e.g., TerminalWindow.js)
- Use camelCase for utility files (e.g., terminalUtils.js)

## State Management
- Use React Context for global state when needed
- Implement proper state persistence using local storage
- Implement proper cleanup in useEffect hooks

## Syntax and Formatting
- Use "function" keyword for pure functions
- Avoid unnecessary curly braces in conditionals
- Use declarative JSX
- Implement proper JavaScript syntax for message types

## UI and Styling
- Use a CSS framework (e.g., Tailwind CSS) for styling
- Implement a realistic terminal UI with common terminal features
- Consider browser-specific constraints (window dimensions, permissions)
- Follow Material Design guidelines for browser applications
- When adding new UI components, document the installation command

## Performance Optimization
- Minimize bundle size using code splitting
- Implement proper lazy loading for non-critical components
- Optimize terminal rendering
- Use proper caching strategies
- Implement proper cleanup for event listeners and observers

## Error Handling
- Implement proper error boundaries
- Log errors appropriately for debugging
- Provide user-friendly error messages
- Handle network failures gracefully

## Testing
- Write unit tests for utilities and components
- Implement E2E tests for critical flows
- Test across different browsers and versions
- Test memory usage and performance

## Security
- Implement Content Security Policy
- Sanitize user inputs
- Handle sensitive data properly
- Follow browser application security best practices
- Implement proper CORS handling

## Git Usage
Commit Message Prefixes:
- "fix:" for bug fixes
- "feat:" for new features
- "perf:" for performance improvements
- "docs:" for documentation changes
- "style:" for formatting changes
- "refactor:" for code refactoring
- "test:" for adding missing tests
- "chore:" for maintenance tasks

Rules:
- Use lowercase for commit messages
- Keep the summary line concise
- Include description for non-obvious changes
- Reference issue numbers when applicable

## Development Workflow
- Use proper version control
- Implement proper code review process
- Test in multiple environments
- Follow semantic versioning for releases
- Maintain changelog

## Recherche Fonctionnelle dans le Terminal (imcomplet, le bouton clear fait toujours les même erreur:
- Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.
- The above error occurred in the <div> component:

    at div
    at div
    at div
    at div

- Consider adding an error boundary to your tree to customize error handling behavior.
https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
Catching rendering errors with an error boundary 
By default, if your application throws an error during rendering, React will remove its UI from the screen. To prevent this, you can wrap a part of your UI into an error boundary. An error boundary is a special component that lets you display some fallback UI instead of the part that crashed—for example, an error message.

To implement an error boundary component, you need to provide static getDerivedStateFromError which lets you update state in response to an error and display an error message to the user. You can also optionally implement componentDidCatch to add some extra logic, for example, to log the error to an analytics service.

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Example "componentStack":
    //   in ComponentThatThrows (created by App)
    //   in ErrorBoundary (created by App)
    //   in div (created by App)
    //   in App
    logErrorToMyService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}
Then you can wrap a part of your component tree with it:

<ErrorBoundary fallback={<p>Something went wrong</p>}>
  <Profile />
<ErrorBoundary>
If Profile or its child component throws an error, ErrorBoundary will “catch” that error, display a fallback UI with the error message you’ve provided, and send a production error report to your error reporting service.

You don’t need to wrap every component into a separate error boundary. When you think about the granularity of error boundaries, consider where it makes sense to display an error message. For example, in a messaging app, it makes sense to place an error boundary around the list of conversations. It also makes sense to place one around every individual message. However, it wouldn’t make sense to place a boundary around every avatar.

Note
There is currently no way to write an error boundary as a function component. However, you don’t have to write the error boundary class yourself. For example, you can use react-error-boundary instead.

Alternatives 
Migrating a simple component from a class to a function 
Typically, you will define components as functions instead.

For example, suppose you’re converting this Greeting class component to a function:
import { Component } from 'react';

class Greeting extends Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>;
  }
}

export default function App() {
  return (
    <>
      <Greeting name="Sara" />
      <Greeting name="Cahal" />
      <Greeting name="Edite" />
    </>
  );
}
</ErrorBoundary>
)
Créer une fonctionnalité de recherche dans le terminal qui permet à l'utilisateur de rechercher des mots ou des phrases dans le contenu du terminal, en excluant les éléments de la classe `terminal-command`. 
La recherche doit être similaire à celle de Google Chrome, où les occurrences de la recherche sont mises en évidence avec un fond gris, et l'occurrence actuelle est mise en évidence avec un fond orange.
Les CSS nécessaires sont déjà présents dans `terminal.css`.
La recherche doit être effectuée via une boite de recherche qui ne recherche que dans le contenu du terminal.
Lorsque l'utilisateur tape des lettres, la première occurrence doit être mise en évidence immédiatement, sans nécessité de presser Entrée.
Lorsque l'utilisateur tape d'autres lettres, l'occurrence actuelle doit rester mise en évidence tant que les lettres correspondent.
L'utilisateur doit pouvoir utiliser les flèches et la touche Entrée pour naviguer entre les occurrences.
Le défilement doit être fonctionnel lorsque la recherche se trouve avant ou après l'occurrence actuelle.
La fonctionnalité de recherche doit être exactement similaire à celle de la recherche dans une page Web avec Google Chrome ou dans le Terminal de VS Code.
Les exigences fonctionnelles sont les suivantes :
* Rechercher dans le contenu du terminal, en excluant les éléments de la classe `terminal-command`
* Mettre en évidence les occurrences de la recherche avec un fond gris
* Mettre en évidence l'occurrence actuelle avec un fond orange
* Permettre à l'utilisateur de naviguer entre les occurrences à l'aide des flèches et de la touche Entrée
* Faire défiler le contenu du terminal lorsque la recherche se trouve avant ou après l'occurrence actuelle
* Mettre en évidence la première occurrence immédiatement lorsque l'utilisateur tape des lettres, sans nécessité de presser Entrée.

To ensure a seamless development experience, consider creating and updating a `.cursorrules`, `.windsurfrules` or `.github/copilot-instructions.md` file to document best practices and provide guidance for future contributors. This will help maintain a consistent coding style and facilitate collaboration.