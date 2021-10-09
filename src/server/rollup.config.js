import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import packageJson from '../../package.json';

export default {
    input: 'index.ts',
    output: [
        { dir: 'dist/' },
        {
            file: packageJson.main,
            format: 'cjs',
            sourcemap: true,
        },
        {
            file: packageJson.module,
            format: 'esm',
            sourcemap: true,
        },
    ],
    plugins: [
        commonjs(),
        typescript(),
    ],
};
