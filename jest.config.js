module.exports = {
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "jsx"],

  setupFilesAfterEnv: ["@testing-library/jest-dom/jest-globals"],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
};
