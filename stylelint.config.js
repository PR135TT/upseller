// stylelint.config.js
module.exports = {
  rules: {
    // ... your other rules ...
  },
  // Tell Stylelint to ignore these Tailwind directives:
  ignoreAtRules: [
    'tailwind',
    'apply',
    'variants',
    'responsive',
    'screen',
  ],
}