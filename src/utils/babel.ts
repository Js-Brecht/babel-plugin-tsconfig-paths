import { NodePath, Node } from "@babel/core";
import { Types, BabelState } from "../types";

/**
 * Checks if the given NodePath represents an import call expression.
 *
 * @param {Types} types - The Types object from the babel parser.
 * @param {NodePath} calleePath - The NodePath to check.
 * @return {boolean} True if the calleePath is an import call expression, false otherwise.
 */
export const isImportCall = (types: Types, calleePath: NodePath) => (
  types.isCallExpression(calleePath.node) && types.isImport(calleePath.node.callee)
);

/**
 * Checks if the given calleePath matches the provided pattern.
 *
 * @param {Types} types - the Types object for AST traversal
 * @param {NodePath} calleePath - the NodePath of the callee
 * @param {string} pattern - the pattern to match against
 * @return {boolean} true if the calleePath matches the pattern, false otherwise
 */
const matchesPattern = (types: Types, calleePath: Types.NodePath, pattern: string) => {
  const { node } = calleePath;
  if (types.isMemberExpression(node)) {
    return calleePath.matchesPattern(pattern);
  }

  if (!types.isIdentifier(node) || pattern.includes('.')) {
    return false;
  }

  const name = pattern.split('.')[0];
  return node.name === name;
};

/**
 * Checks if the given `calleePath` matches any of the transform functions defined in the state.
 *
 * @param {BabelState} state - The state object containing the runtime options.
 * @param {NodePath} calleePath - The path of the callee function.
 * @return {boolean} True if the calleePath of the igven node atches any of the transform functions, false otherwise.
 */
export const matchesTransformFn = (state: BabelState, calleePath: NodePath) => {
  const { transformFunctions } = state.runtimeOpts;
  return transformFunctions.some((pattern: string) => (
    matchesPattern(state.types, calleePath, pattern)
  ));
};

/**
 * Determines whether a node should be skipped.
 *
 * @param {NodePath} node - The node to be checked.
 * @param {BabelState} state - The current state of the Babel transformer.
 * @return {boolean} True if the node should be skipped, false otherwise.
 */
export const shouldSkipNode = (node: NodePath, state: BabelState) => {
  const { skipModuleResolver } = state.runtimeOpts

  if (skipModuleResolver || state.resolverVisited.has(node)) {
    return true;
  }
  return false;
};

export function isResolvablePathNode(node: Node | Node[], state: BabelState): node is Types.ResolvableStringLiteral {
  if (Array.isArray(node)) {
    return node.some((n) => isResolvablePathNode(n, state));
  }
  if (node != null && state.types.isStringLiteral(node)) {
    if (!("pathResolved" in node)) {
      (node as Types.ResolvableStringLiteral).pathResolved = false;
    }
    return true;
  }

  return false;
}