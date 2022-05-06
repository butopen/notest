const watch = process.argv.includes("-w")


const options = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: false,
    sourcemap: true,
    external: ['node-fetch', 'flatted'],
}
if (watch) {
    options.watch = {
        onRebuild(error, result) {
            if (error) console.error('watch build failed:', error)
            else console.log('watch build succeeded:', result)
        },
    }
}

const esbuild = require('esbuild')
esbuild.build({
    ...options,
    platform: 'node',
    format: 'esm',
    target: 'es2020',
    outfile: 'dist/index.esm.js'
});
esbuild.build({
    ...options,
    platform: 'node',
    format: 'cjs',
    outfile: 'dist/index.js'
});
