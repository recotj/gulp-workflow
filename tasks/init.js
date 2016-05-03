'use strict';

const pkgJSON = require('../package.json');
const where = pkgJSON['_where'];

let initialized = false;

module.exports = (config) => {
	if (initialized) return;
	initialized = true;

	initWorkFlowConfig(config);
};

function initWorkFlowConfig(config) {
	const Path = require('path');

	config = config || {};

	global.PACKAGES_PATH = config.PACKAGES_PATH || 'packages';
	global.DIST_PATH = config.DIST_PATH || 'lib';
	global.ENTRY_FILE = config.ENTRY_FILE || 'entry.js';
	global.PACKAGE_PREFIX = config.PACKAGE_PREFIX || '';
	global.PACKAGE_NAME = require(Path.resolve(where, 'package.json')).name;
	global.PROJECT_NAME = global.PACKAGE_NAME;
}
