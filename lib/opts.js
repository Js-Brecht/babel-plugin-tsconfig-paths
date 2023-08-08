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
    skipModuleResolver: false,
    keepSourceExt: false,
};
const mapOptions = (newOptions) => (Object.assign({}, (0, utils_1.mergeAndMapKeys)(defaultOptions, newOptions, {
    rootDir: "basePath",
})));
const getConfigResolverOptions = (options) => (Object.assign({ strict: false }, options));
const getOptions = (inputOpts = {}) => {
    var _a;
    const opts = mapOptions(inputOpts);
    const rootDir = (0, utils_1.getRootDir)(opts.basePath);
    const configResolverOptions = getConfigResolverOptions({
        basePath: rootDir,
        extensions: ["", "json"],
        strict: true,
        keepSourceExt: opts.keepSourceExt,
    });
    const tsconfigPath = (0, utils_1.resolveFile)(inputOpts.tsconfig || "tsconfig.json", configResolverOptions);
    const { tsconfig, aliases } = (0, tsconfig_1.getTsConfig)(tsconfigPath, configResolverOptions);
    const configPath = (0, tsconfig_1.getConfigPath)(opts.tsconfig, rootDir);
    const base = ((_a = tsconfig.compilerOptions) === null || _a === void 0 ? void 0 : _a.baseUrl) || '';
    const basePath = path_1.default.isAbsolute(base)
        ? base
        : path_1.default.resolve(path_1.default.join(path_1.default.dirname(configPath), base));
    return {
        configPath,
        basePath,
        aliases,
        keepSourceExt: opts.keepSourceExt == null ? false : opts.keepSourceExt,
        relative: opts.relative == null ? true : opts.relative,
        extensions: (0, uniq_1.default)(['', ...(opts.extensions || defaultExtensions)]),
        transformFunctions: opts.transformFunctions || transformFunctions,
        skipModuleResolver: !base
    };
};
exports.getOptions = getOptions;
//# sourceMappingURL=opts.js.map