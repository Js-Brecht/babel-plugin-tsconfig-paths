"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@babel/core");
const opts_1 = require("./opts");
const utils_1 = require("./utils");
const resolve_1 = require("./resolve");
function BabelPluginTsconfigPaths(api) {
    api.assertVersion(7);
    return {
        name: 'tsconfig-paths-resolver',
        pre() {
            this.types = core_1.types;
            this.runtimeOpts = (0, opts_1.getOptions)(this.opts);
            this.resolverVisited = new Set();
        },
        post() {
            this.resolverVisited.clear();
        },
        visitor: {
            CallExpression(node, state) {
                if ((0, utils_1.shouldSkipNode)(node, state))
                    return;
                const calleeNodePath = node.get('callee');
                const calleePath = calleeNodePath;
                if ((0, utils_1.matchesTransformFn)(state, calleePath) ||
                    (0, utils_1.isImportCall)(state.types, node)) {
                    state.resolverVisited.add(node);
                    (0, resolve_1.updateImportPath)(node.get('arguments.0'), state);
                }
            },
            'ImportDeclaration|ExportDeclaration': (node, state) => {
                if ((0, utils_1.shouldSkipNode)(node, state))
                    return;
                state.resolverVisited.add(node);
                (0, resolve_1.updateImportPath)(node.get('source'), state);
            }
        }
    };
}
exports.default = BabelPluginTsconfigPaths;
//# sourceMappingURL=index.js.map