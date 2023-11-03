import path from 'node:path';

// Exports ---------------------------------------------------------------------

export const revealBasePath = path.resolve(import.meta.resolve('reveal.js'), '..', '..');
export const highlightThemePath = path.resolve(import.meta.resolve('highlight.js'), '..', '..', 'styles');
