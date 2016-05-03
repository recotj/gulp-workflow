'use strict';

const pkgJSON = getPackageJSON();
const where = pkgJSON['_where'];

if (!where) throw new Error('no parent module found.');

let initialized = false;

module.exports = (config) => {
	if (initialized) return;
	initialized = true;

	initWorkFlowConfig(config);
};

function initWorkFlowConfig(config) {
	config = config || {};

	global.PACKAGES_PATH = config.PACKAGES_PATH || 'packages';
	global.DIST_PATH = config.DIST_PATH || 'lib';
	global.ENTRY_FILE = config.ENTRY_FILE || 'entry.js';
	global.PACKAGE_PREFIX = config.PACKAGE_PREFIX || '';
	global.PACKAGE_NAME = getPackageJSON(where).name;
	global.PROJECT_NAME = global.PACKAGE_NAME;
}

function getPackageJSON(moduleId) {
	const execSync = require('child_process').execSync;
	const path = require('path');

	moduleId = moduleId || execSync('npm prefix', { cwd: __dirname }).toString('utf8').replace(/[\r\n\s]+$/, '');
	return require(path.resolve(moduleId, 'package.json'));
}
