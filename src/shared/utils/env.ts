// weird workaround to get all ENV values (accessing process.env directly only returns a subset)
// export const PROCESS_ENV = JSON.parse(JSON.stringify(process)).env;
import {execaSync} from 'execa';
import nodeProcess from 'node:process';
import stripAnsi from 'strip-ansi';

const args = ['-ilc', 'echo -n "_SHELL_ENV_DELIMITER_"; env; echo -n "_SHELL_ENV_DELIMITER_"; exit'];

const ENV = {
  // Disables Oh My Zsh auto-update thing that can block the process.
  DISABLE_AUTO_UPDATE: 'true',
};

const detectShell = () => {
  const {env} = nodeProcess;

  if (process.platform === 'win32') {
    return env.COMSPEC || 'cmd.exe';
  }

  if (process.platform === 'darwin') {
    return env.SHELL || '/bin/zsh';
  }

  return env.SHELL || '/bin/sh';
};

const detectedShell = detectShell();

const parseEnv = (output: string): NodeJS.ProcessEnv => {
  const env = output.split('_SHELL_ENV_DELIMITER_')[1];
  if (env === undefined) {
    throw new Error('Shell environment output is missing its delimiter.');
  }
  const returnValue: NodeJS.ProcessEnv = {};

  stripAnsi(env)
    .split('\n')
    .filter(filteredLine => Boolean(filteredLine))
    .forEach(line => {
      const [key, ...values] = line.split('=');
      returnValue[key] = values.join('=');
    });

  return returnValue;
};

export function shellEnvSync(): NodeJS.ProcessEnv {
  if (process.platform === 'win32') {
    return nodeProcess.env;
  }

  try {
    const {stdout} = execaSync(detectedShell, args, {extendEnv: true, env: ENV});
    return parseEnv(stdout);
  } catch (error) {
    if (detectedShell) {
      throw error;
    } else {
      return nodeProcess.env;
    }
  }
}

let mainProcessEnv: NodeJS.ProcessEnv | undefined;

export function getMainProcessEnv() {
  if (!mainProcessEnv) {
    mainProcessEnv = shellEnvSync();
  }
  return mainProcessEnv;
}

export function setMainProcessEnv(env: NodeJS.ProcessEnv) {
  mainProcessEnv = env;
}
