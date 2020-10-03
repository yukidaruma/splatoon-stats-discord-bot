/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly DISCORD_API_TOKEN?: string;
  }
}

type Nullable<T> = null | T;
