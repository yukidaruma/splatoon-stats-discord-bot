/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly DISCORD_API_TOKEN?: string;
    readonly NODE_ENV?: 'development' | 'production' | 'test';
    readonly LOG_LEVEL?: string;
  }
}

type Nullable<T> = null | T;
