import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  {
    ignores: [
      'node_modules',
      '.next',
      'dist',
      'build',
      'prisma',
      'src/generated/prisma',
      'tailwind.config.js',
      'postcss.config.js',
      'eslint.config.js',
    ],
  },
  js.configs.recommended,
  nextPlugin.configs.recommended,
];
