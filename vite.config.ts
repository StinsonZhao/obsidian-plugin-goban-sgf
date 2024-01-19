import { defineConfig } from 'vite'
import path from 'path'
import preact from '@preact/preset-vite'
import builtins from 'builtin-modules'
import manifest from './manifest.json'

const prod = process.argv[2] === 'production'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  build: {
    sourcemap: prod ? false : 'inline',
    minify: prod,
    commonjsOptions: {
      ignoreTryCatch: false,
    },
    lib: {
      entry: path.resolve(__dirname, './src/main.ts'),
			formats: ['cjs'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'main.js',
        assetFileNames: 'styles.css',
      },
      external: [
        'obsidian',
        'electron',
        'codemirror',
        '@codemirror/autocomplete',
        '@codemirror/closebrackets',
        '@codemirror/collab',
        '@codemirror/commands',
        '@codemirror/comment',
        '@codemirror/fold',
        '@codemirror/gutter',
        '@codemirror/highlight',
        '@codemirror/history',
        '@codemirror/language',
        '@codemirror/lint',
        '@codemirror/matchbrackets',
        '@codemirror/panel',
        '@codemirror/rangeset',
        '@codemirror/rectangular-selection',
        '@codemirror/search',
        '@codemirror/state',
        '@codemirror/stream-parser',
        '@codemirror/text',
        '@codemirror/tooltip',
        '@codemirror/view',
        '@lezer/common',
        '@lezer/lr',
        '@lezer/highlight',
        ...builtins,
      ],
    },
		emptyOutDir: false,
    outDir: '.',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  define: {
    'process.env': {
      PLUGIN_VERSION: manifest.version,
    },
  },
})
