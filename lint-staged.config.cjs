module.exports = {
  './src/**/*': ['npm run ci.eslint -- --fix', () => 'npm run ci.typecheck'],
  '**/*': ['npm run ci.prettier -- --write'],
};
