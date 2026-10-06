export default {
  '{src,electron,tests}/**/*.{js,jsx,ts,tsx}': [
    'biome lint --no-errors-on-unmatched',
    'prettier --write',
    'stylelint --allow-empty-input',
  ],
  'src/**/*.css': ['stylelint --allow-empty-input', 'prettier --write'],
};
