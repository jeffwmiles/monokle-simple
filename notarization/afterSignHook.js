/* eslint-disable */
const fs = require('fs');
const path = require('path');
const log = require('loglevel');

const environmentFile = path.resolve('.env');
if (fs.existsSync(environmentFile)) {
  process.loadEnvFile(environmentFile);
}

module.exports = async function (params) {
  // Only notarize the app if building for macOS and the NOTARIZE environment
  // variable is present.
  if (!process.env.NOTARIZE || process.platform !== 'darwin') {
    return;
  }
  const appId = params.packager.appInfo.id;
  const appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`);
  }

  const {APPLE_TEAM_ID: teamId, APPLE_ID: appleId, APPLE_APP_SPECIFIC_PASSWORD: appleIdPassword} = process.env;
  if (!teamId || !appleId || !appleIdPassword) {
    throw new Error('Notarization requires APPLE_TEAM_ID, APPLE_ID, and APPLE_APP_SPECIFIC_PASSWORD.');
  }

  log.info(`Notarizing ${appId} found at ${appPath}`);

  const {notarize} = await import('@electron/notarize');
  await notarize({teamId, appPath, appleId, appleIdPassword});

  log.info(`Done notarizing ${appId}`);
};
