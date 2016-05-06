'use strict';

const root = getPackageJSON()['_where'];

if (!root) throw new Error('no package root found.');

// init value
global.PACKAGES_PATH = 'packages';
global.DIST_PATH = 'lib';
global.ENTRY_FILE = 'entry.js';
global.PACKAGE_PREFIX = '';
global.PACKAGE_NAME = getPackageJSON(root).name;
global.PROJECT_NAME = global.PACKAGE_NAME;
global.PACKAGE_ROOT = root;

let initialized = false;

module.exports = (config) => {
	if (initialized) return;
	initialized = true;

	initWorkFlowConfig(config);
};

function initWorkFlowConfig(config) {
	if (!config) return;

	['PACKAGES_PATH', 'DIST_PATH', 'ENTRY_FILE', 'PACKAGE_PREFIX'].forEach((key) => {
		if (config[key]) global[key] = config[key];
	});
}

function getPackageJSON(moduleId) {
	const execSync = require('child_process').execSync;
	const path = require('path');

	moduleId = moduleId || execSync('npm prefix', { cwd: __dirname }).toString('utf8').replace(/[\r\n\s]+$/, '');
	return require(path.resolve(moduleId, 'package.json'));
}
