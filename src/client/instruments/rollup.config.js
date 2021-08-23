const template = require('@flybywiresim/rollup-plugin-msfs');
const postcss = require('rollup-plugin-postcss');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { babel } = require('@rollup/plugin-babel');
const replace = require('@rollup/plugin-replace');
const commonjs = require('@rollup/plugin-commonjs');

const TMPDIR = `${__dirname}../../../../../ace/bundles/flightplanning`;
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

module.exports = [{
    input: `${__dirname}/src/display1/index.tsx`,
    output: {
        name: 'display1',
        file: `${TMPDIR}/display1/bundle.js`,
        format: 'iife',
    },
    plugins: [
        postcss({
            // Or with custom file name, it will generate file relative to bundle.js in v3
            extract: `${TMPDIR}/display1/bundle.css`
        }),
        replace({ 'process.env.NODE_ENV': '"production"' }),
        commonjs({ include: /node_modules/ }),
        babel({
            presets: [
                ['@babel/preset-env', { targets: { safari: '11' } }],
                ['@babel/preset-react', { runtime: 'automatic' }],
                ['@babel/preset-typescript']
            ],
            plugins: [
                '@babel/plugin-proposal-class-properties',
                ['@babel/plugin-transform-runtime', { regenerator: true }]
            ],
            babelHelpers: 'runtime',
            compact: false,
            extensions
        }),
        nodeResolve({ extensions }),
        template({
            name: 'display1',
            elementName: 'flightplanning-display1',
            config: {index:`${__dirname}/display1/index.tsx`, isInteractive: true },
            outputDir: `${__dirname}/../../A380X/html_ui\\Pages\\VCockpit\\Instruments/A380X`,
        })]
}]
