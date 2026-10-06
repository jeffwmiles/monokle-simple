exports.default = function customSign() {
  // Windows signing is disabled for local builds, including the NSIS installer.
  return Promise.resolve();
};
