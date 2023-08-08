import { NodePath } from "@babel/traverse";
import { ConfigAPI, PluginObj, types } from "@babel/core";

import { getOptions } from "./opts"
import { matchesTransformFn, isImportCall, shouldSkipNode } from "./utils"
import { updateImportPath } from "./resolve"

import type { BabelState, PluginInstance } from "./types";


export default function BabelPluginTsconfigPaths(api: ConfigAPI): PluginObj<PluginInstance> {
  api.assertVersion(7)

  return {
    name: 'tsconfig-paths-resolver',

    pre() {
      this.types = types;
      this.runtimeOpts = getOptions(this.opts)
      this.resolverVisited = new Set<NodePath>()
    },

    post() {
      this.resolverVisited.clear()
    },

    visitor: {
      CallExpression(node: NodePath<types.CallExpression>, state: BabelState) {
        if (shouldSkipNode(node, state)) return

        const calleeNodePath = node.get('callee')
        type CalleePathType = Exclude<typeof calleeNodePath, Array<any>>;
        const calleePath = calleeNodePath as CalleePathType
        if (
          matchesTransformFn(state, calleePath) ||
          isImportCall(state.types, node)
        ) {
          state.resolverVisited.add(node)
          updateImportPath(node.get('arguments.0'), state)
        }
      },

      'ImportDeclaration|ExportDeclaration': (node: NodePath, state: BabelState) => {
        if (shouldSkipNode(node, state)) return
        state.resolverVisited.add(node)

        updateImportPath(node.get('source'), state)
      }
    }
  }
}
