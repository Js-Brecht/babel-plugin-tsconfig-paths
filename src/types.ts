import type { ParsedTsconfig } from "typescript";
import type { Get, TsConfigJson as Tsconfig } from "type-fest";
import { NodePath as CoreNodePath, PluginPass, types } from "@babel/core";

export type Maybe<T, O = undefined | null | void> = T | O;
export type AnyFunction = (...args: any[]) => any;
export type AnyObject = Record<keyof any, any>

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
  keepSourceExt: boolean;
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
  keepSourceExt: boolean;
}
export interface ResolvableStringLiteral extends types.StringLiteral {
  pathResolved?: boolean;
}

export interface BabelState extends PluginInstance { }

export type { Tsconfig }
export type TsConfigPaths = Get<ParsedTsconfig, Readonly<["options", "paths"]>, {
  strict: true,
}>;
export type CachedTsPathsFn = (tsconfig: Tsconfig, root: string) => any;

export type ResolverFnOptions = Pick<RuntimeOptions, "basePath" | "extensions" | "keepSourceExt"> & {
  /** Disallow the resolver from considering null as valid return value */
  strict?: boolean;
  errHandler?: (error: Error) => void;
}
export interface TsconfigResolverOptions extends ResolverFnOptions {
  tsconfigPath?: string;
}

export type ResolverFn = <O extends ResolverFnOptions>(pathname: string, opts: O) => (
  ResolverFnOptions["strict"] extends true ? string : Maybe<string | Error>
);
export type ResolveFileReducer = ResolverFn extends (...args: infer A) => infer R
  ? (...args: A) => Exclude<R, Error> : never;

export type CodedError = Error & {
  code: string;
}