const path = require('path');
const derequire = require('browserify-derequire');
const collapse = require('bundle-collapser/plugin');

const PACKAGE_NAME = require('../../package.json').name;
const PACKAGES_PATH = './packages';
const DIST_PATH = './lib';
const ENTRY_FILE = 'entry.js';

const basic = {
	entries: [ENTRY_FILE],
	basedir: DIST_PATH,
	outfile: path.join(DIST_PATH, `${PACKAGE_NAME}.js`),
	standalone: PACKAGE_NAME,
	// @see https://github.com/rse/browserify-derequire#about
	// "even in standalone mode all require() calls are left intact. and this causes trouble on
	// subsequent embedding of the bundle (and this way reanalyzing) in other Browserify toolchains"
	plugin: [derequire]
};

const min = {
	entries: [ENTRY_FILE],
	basedir: DIST_PATH,
	outfile: path.join(DIST_PATH, `${PACKAGE_NAME}.min.js`),
	standalone: PACKAGE_NAME,
	plugin: [derequire, collapse]
};

module.exports = {basic, min};