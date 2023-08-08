import type { ParsedTsconfig } from "typescript";
import type { Get, TsConfigJson as TsConfig } from "type-fest";
import { NodePath as CoreNodePath, PluginPass, types } from "@babel/core";

// export { types }
declare module "@babel/core" {
  namespace types {
    export type NodePath = CoreNodePath<Node>;
    export interface ResolvableStringLiteral extends types.StringLiteral {
      pathResolved?: boolean;
    }
  }
}
import Types = types
type Types = typeof Types
export type { Types };

export interface Alias {
  alias: RegExp
  transformers: string[]
}

export interface PluginOptions {
  rootDir?: string
  tsconfig?: string
  relative?: boolean
  extensions?: string[]
}

export interface PluginInstance extends PluginPass {
  resolverVisited: Set<Types.Node | Types.NodePath>;
  types: Types;
  runtimeOpts: RuntimeOptions;
  opts: PluginOptions;
}
export interface RuntimeOptions {
  configPath: string;
  basePath: string;
  aliases: {
    alias: RegExp, transformers: string[]
  }[];
  relative: boolean;
  extensions: string[];
  transformFunctions: string[];
  skipModuleResolver: boolean;
}
export interface ResolvableStringLiteral extends types.StringLiteral {
  pathResolved?: boolean;
}

export interface BabelState extends PluginInstance { }

export type { TsConfig }
export type TsConfigPaths = Get<ParsedTsconfig, Readonly<["options", "paths"]>, {
  strict: true,
}>;
export type CachedTsPathsFn = (tsconfig: TsConfig, root: string) => any;
