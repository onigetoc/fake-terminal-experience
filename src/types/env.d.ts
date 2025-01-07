declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    HOST: string;
    ALLOWED_COMMANDS: string;
    BLOCKED_COMMANDS: string;
    MAX_COMMAND_LENGTH: string;
    NODE_ENV: 'development' | 'production';
    CORS_ORIGIN: string;
    DEFAULT_TERMINAL_HEIGHT: string;
    MAX_HISTORY_LENGTH: string;
  }
}
