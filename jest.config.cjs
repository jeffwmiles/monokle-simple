const paths = require('./tsconfig.paths.json').compilerOptions.paths;

const swcTransform = parser => [
  '@swc/jest',
  {
    jsc: {parser, target: 'es2022', transform: {react: {runtime: 'automatic'}}},
    module: {type: 'commonjs'},
  },
];

module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.[jt]s?(x)', '<rootDir>/electron/**/*.test.[jt]s?(x)'],
  modulePathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/dist/', '<rootDir>/.toolchain/'],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\](?!(?:uuid|@ant-design[/\\\\](?:colors|fast-color))[/\\\\])'],
  moduleNameMapper: Object.fromEntries(
    Object.entries(paths).map(([name, targets]) => {
      const pattern = name
        .split('*')
        .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('(.*)');
      return [`^${pattern}$`, targets.map(target => `<rootDir>/${target.replace('*', '$1')}`)];
    })
  ),
  transform: {
    '^.+\\.tsx$': swcTransform({syntax: 'typescript', tsx: true}),
    '^.+\\.ts$': swcTransform({syntax: 'typescript', tsx: false}),
    '^.+\\.[cm]?jsx?$': swcTransform({syntax: 'ecmascript', jsx: true}),
  },
};
