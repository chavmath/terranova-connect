const path = require("path");

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
  },
};
