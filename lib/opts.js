"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptions = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const uniq_1 = tslib_1.__importDefault(require("lodash/uniq"));
const utils_1 = require("./utils");
const tsconfig_1 = require("./tsconfig");
const defaultExtensions = ['.js', '.jsx', '.ts', '.tsx', '.es', '.es6', '.mjs'];
const transformFunctions = [
    'require',
    'require.resolve',
    'System.import',
    'jest.genMockFromModule',
    'jest.mock',
    'jest.unmock',
    'jest.doMock',
    'jest.dontMock',
    'jest.setMock',
    'require.requireActual',
    'require.requireMock'
];
const defaultOptions = {
    aliases: [],
    basePath: process.cwd(),
    configPath: "tsconfig.json",
    extensions: defaultExtensions,
    relative: true,
    transformFunctions: [],
    skipModuleResolver: false
};
const mapOptions = (newOptions) => (Object.assign({}, (0, utils_1.mergeAndMapKeys)(defaultOptions, newOptions, {
    rootDir: "basePath",
})));
const getTsconfigAliases = (0, tsconfig_1.cacheTsPaths)((tsconfig = {
    compilerOptions: {}
}) => {
    var _a;
    const aliases = ((_a = tsconfig.compilerOptions) === null || _a === void 0 ? void 0 : _a.paths) || {};
    const resolveAliases = [];
    Object.entries(aliases).forEach(([alias, resolutions]) => {
        const newAlias = new RegExp(`^${(0, utils_1.escapeRegExp)(alias).replace(/\*/g, '(.+)')}`);
        const transformers = resolutions.map((res) => {
            for (let cnt = 1; res.indexOf("*") > -1; cnt++) {
                res = res.replace("*", `($${cnt})`);
            }
            return res;
        });
        resolveAliases.push({
            alias: newAlias,
            transformers
        });
    });
    return resolveAliases;
});
const getOptions = (inputOpts = {}) => {
    const opts = mapOptions(inputOpts);
    const rootDir = (0, tsconfig_1.getRootDir)(opts.basePath);
    const configPath = (0, tsconfig_1.getConfigPath)(opts.tsconfig, rootDir);
    const tsconfig = require(configPath);
    const base = tsconfig.compilerOptions.baseUrl || '';
    const basePath = path_1.default.isAbsolute(base)
        ? base
        : path_1.default.resolve(path_1.default.join(path_1.default.dirname(configPath), base));
    return {
        configPath,
        basePath,
        aliases: getTsconfigAliases(tsconfig, rootDir),
        relative: opts.relative || true,
        // If the original import has an extension, then check for it, too, when
        // checking for existence of the file
        extensions: (0, uniq_1.default)(['', ...(opts.extensions || defaultExtensions)]),
        transformFunctions: opts.transformFunctions || transformFunctions,
        skipModuleResolver: !base
    };
};
exports.getOptions = getOptions;
//# sourceMappingURL=opts.js.map