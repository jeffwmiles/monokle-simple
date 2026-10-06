const https = require('https');
const fs = require('node:fs');
const path = require('node:path');
const semver = require('semver');

const manifest = require('../package.json');

const dependencies = {...manifest.dependencies, ...manifest.devDependencies};

function latestMetadata(name) {
  return new Promise((resolve, reject) => {
    const request = https.get(`https://registry.npmjs.org/${encodeURIComponent(name)}/latest`, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Registry returned ${response.statusCode} for ${name}`));
        return;
      }
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => {
        body += chunk;
      });
      response.on('error', reject);
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });
    request.setTimeout(20000, () => request.destroy(new Error(`Registry timeout for ${name}`)));
    request.on('error', reject);
  });
}

async function audit() {
  const names = Object.keys(dependencies).sort();
  const results = new Map();
  const failures = [];
  let nextIndex = 0;
  await Promise.all(
    Array.from({length: 6}, async () => {
      while (nextIndex < names.length) {
        const name = names[nextIndex];
        nextIndex += 1;
        try {
          results.set(name, await latestMetadata(name));
        } catch (error) {
          failures.push({name, error: error.message});
        }
      }
    })
  );

  const packages = names
    .filter(name => results.has(name))
    .map(name => {
      const latest = results.get(name);
      const peerConflicts = Object.entries(latest.peerDependencies || {}).flatMap(([peer, range]) => {
        const target = results.get(peer)?.version;
        if (!target || semver.satisfies(target, range, {includePrerelease: true})) return [];
        return [{peer, required: range, proposed: target}];
      });
      return {
        name,
        current: dependencies[name],
        latest: latest.version,
        deprecated: latest.deprecated || null,
        engines: latest.engines || {},
        esm: latest.type === 'module',
        peerConflicts,
      };
    });

  const report = {
    checkedAt: new Date().toISOString(),
    registry: 'https://registry.npmjs.org',
    runtime: process.version,
    checked: packages.length,
    outdated: packages.filter(packageInfo => packageInfo.current !== packageInfo.latest).length,
    failures,
    packages,
  };

  if (process.argv.includes('--apply')) {
    if (failures.length) throw new Error('Dependency versions were not changed because registry queries failed.');
    for (const packageInfo of packages) {
      for (const section of ['dependencies', 'devDependencies']) {
        if (manifest[section]?.[packageInfo.name]) manifest[section][packageInfo.name] = packageInfo.latest;
      }
    }
    fs.writeFileSync(path.join(__dirname, '..', 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  }

  if (process.argv.includes('--summary')) {
    console.log(
      `Checked ${report.checked} packages; ${report.outdated} differ from latest; ${failures.length} registry failures.`
    );
    for (const packageInfo of packages) {
      if (packageInfo.current !== packageInfo.latest || packageInfo.deprecated || packageInfo.peerConflicts.length) {
        console.log(
          `${packageInfo.name}: ${packageInfo.current} -> ${packageInfo.latest}${packageInfo.esm ? ' [ESM]' : ''}`
        );
      }
      if (packageInfo.deprecated) console.log(`  Deprecated: ${packageInfo.deprecated}`);
      for (const conflict of packageInfo.peerConflicts) {
        console.log(`  CONFLICT: requires ${conflict.peer} ${conflict.required}; proposed ${conflict.proposed}`);
      }
    }
    for (const failure of failures) console.error(`${failure.name}: ${failure.error}`);
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
  if (failures.length) process.exitCode = 1;
}

audit().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
