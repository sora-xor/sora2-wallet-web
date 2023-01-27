module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  setupFiles: ['./tests/unit/setup.js'],
  verbose: true,
  moduleNameMapper: {
    '^.+/(.*\\.svg)\\?inline$': '<rootDir>/src/assets/img/$1',
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.svg$': '<rootDir>/.jest/svgTransform.js',
  },
  transformIgnorePatterns: ['node_modules/?!(@polkadot/util)'],
  clearMocks: true,
  setupFilesAfterEnv: ['jest-extended'],
};
