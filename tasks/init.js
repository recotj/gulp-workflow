let initialized = false;

module.exports = (config) => {
	if (initialized) return;
	initialized = true;

	global.PACKAGES_PATH = config.PACKAGES_PATH || 'packages';
	global.DIST_PATH = config.DIST_PATH || 'lib';
	global.ENTRY_FILE = config.ENTRY_FILE || 'entry.js';
	global.PACKAGE_PREFIX = config.PACKAGE_PREFIX || '';

	const execSync = require('child_process').execSync;
	const out = execSync('npm root', {cwd: process.cwd()});

	global.PACKAGE_NAME = String(out).replace(/[\r\n\s]+$/, '');
	global.PROJECT_NAME = global.PACKAGE_NAME;
};
