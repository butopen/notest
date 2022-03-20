import esbuild from 'esbuild'

const watch = process.argv.includes("-w")


const options = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: false,
    sourcemap: true,
    platform: 'node',
    external: ['ts-morph', 'chokidar', '@butopen/notest-collector'],
    format: 'esm',
    target: 'es2020',
    outfile: 'dist/index.js',
}
if (watch) {
    options.watch = {
        onRebuild(error, result) {
            if (error) console.error('watch build failed:', error)
            else console.log('watch build succeeded:', result)
        },
    }
}

esbuild.build(options)
