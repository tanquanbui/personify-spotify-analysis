'use strict';

module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: ['<rootDir>/src/**/*.{spec,test}.{js,jsx}'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': [
      'babel-jest',
      {
        presets: [
          ['babel-preset-react-app', { runtime: 'automatic' }],
        ],
        babelrc: false,
        configFile: false,
      },
    ],
    '^.+\\.css$': '<rootDir>/node_modules/react-scripts/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|css|json)$)': '<rootDir>/node_modules/react-scripts/config/jest/fileTransform.js',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^.+\\.(css|svg)$': '<rootDir>/node_modules/react-scripts/config/jest/fileTransform.js',
  },
  setupFilesAfterFramework: [],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  resetMocks: true,
};
