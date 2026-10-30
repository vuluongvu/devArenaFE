/// <reference types="monaco-editor" />

declare global {
  interface Window {
    monaco?: typeof monaco;
    require?: any;
    MonacoEnvironment?: any;
  }
}

export {};
