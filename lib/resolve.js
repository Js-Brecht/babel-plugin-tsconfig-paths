"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateImportPath = void 0;
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const utils_1 = require("./utils");
/**
 * Finds the resolver for the given import path in the list of aliases.
 *
 * @param {string} importPath - The import path to find the resolver for.
 * @param {Alias[]} aliases - The list of aliases to search through.
 * @return {Alias | undefined} - The resolver for the import path, or undefined if not found.
 */
const getResolvers = (importPath, aliases) => {
    const resolver = aliases.find(({ alias }) => alias.test(importPath));
    return resolver;
};
/**
 * Resolves the import path based on the aliases and options provided.
 *
 * Assuming an alias like this:
 * "~/*": ["src/*"]
 *
 * And an import like this:
 * "~/app"
 *
 * This function will see that `~/*` matches `~/app`, and use a regular
 * expression to replace `/^~\/(.+)/` with `src/` like this:
 *
 * '~/app'.replace(/^~\/(.+)/, 'src/')
 *
 * Then it will prepend the absolute `basePath` collected from
 * `tsconfig` to the import path.
 *
 * If `relative` is set to true, it will then use that absolute path to retrieve
 * the relative path of the import (relative to the original source file).
 *
 * @param {string} sourceFile - The original source file that the import
 * was found in.
 * @param {string} importPath - The path to the file being imported (the
 * string that needs to be resolved).
 * @param {RuntimeOptions} opts - The runtime options including the `basePath`,
 * `aliases`, and `relative` flag.
 * @returns {string | void} - The resolved path of the import. If unable to return a
 * resolved path, then void is returned.
 */
const resolvePath = (sourceFile, importPath, opts) => {
    const { basePath, aliases, relative } = opts;
    // Get the resolver for the import path
    const resolver = getResolvers(importPath, aliases);
    if (!resolver)
        return;
    const { alias, transformers } = resolver;
    // Iterate through each transformer and resolve the import path
    for (const transformer of transformers) {
        const transformedImport = path.join(basePath, importPath.replace(alias, transformer));
        const resolvedImport = (0, utils_1.resolveFile)(transformedImport, {
            basePath: opts.basePath,
            strict: true,
            extensions: opts.extensions,
            keepSourceExt: opts.keepSourceExt
        });
        // Return the resolved import path
        return !!resolvedImport
            ? relative
                ? (0, utils_1.getRelativePath)(sourceFile, resolvedImport)
                : resolvedImport
            : void 0;
    }
};
/**
 * Updates the import path for a given nodePath and state.
 *
 * @param {NodePath | null} nodePath - The nodePath to update the import path for.
 * @param {BabelState} state - The state object.
 * @return {void} This function does not return anything.
 */
const updateImportPath = (nodePath, state) => {
    if (Array.isArray(nodePath))
        return nodePath.forEach((n) => { (0, exports.updateImportPath)(n, state); });
    if (!nodePath || !(0, utils_1.isResolvablePathNode)(nodePath === null || nodePath === void 0 ? void 0 : nodePath.node, state)) {
        return;
    }
    const currentFile = state.file.opts.filename;
    const importPath = nodePath === null || nodePath === void 0 ? void 0 : nodePath.node.value;
    const modulePath = resolvePath(currentFile, importPath, state.runtimeOpts);
    if (nodePath && modulePath) {
        nodePath.replaceWith(state.types.stringLiteral(modulePath));
        nodePath.node.pathResolved = true;
    }
};
exports.updateImportPath = updateImportPath;
//# sourceMappingURL=resolve.js.map