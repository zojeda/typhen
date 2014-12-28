/// <reference path="../../typings/tsd.d.ts" />

interface IEnvironment {
  currentDirectory: string;
  newLine: string;
  useCaseSensitiveFileNames: boolean;

  readFile(fileName: string): string;
  writeFile(fileName: string, data: string): void;
  resolvePath(...pathSegments: string[]): string;
  exists(fileName: string): boolean;
}

export = IEnvironment;