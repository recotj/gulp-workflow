const gulp = require('gulp');

module.exports.packages = packages;
module.exports.entry = entry;
module.exports.basic = basic;
module.exports.min = min;

function packages(done) {
	const plumber = require('gulp-plumber');
	const gutil = require('gulp-util');
	const newer = require('gulp-newer');
	const through = require('through2');
	const babel = require('gulp-babel');
	const chalk = require('chalk');
	const add = require('gulp-add-src');
	const merge = require('merge-stream');

	const replace = require('../utils/paths').replace;

	return merge(compilePackages(done), collectPackageDeps(done));

	function compilePackages(done) {
		return gulp.src(`${PACKAGES_PATH}/*/src/**/*.js`)
			.pipe(plumber({
				errorHandler(err) {
					gutil.log(err.stack);
				}
			}))
			.pipe(through.obj((file, enc, callback) => {
				const srcPattern = new RegExp(`${PACKAGES_PATH}(\\/[^\\/]+)\\/src\\/`);
				const distPattern = `${DIST_PATH}/$1/lib/`;
				const path = file.path;

				file.path = replace(path, srcPattern, distPattern);
				gutil.log('compiling', `'${chalk.cyan(path)}'...`);
				callback(null, file);
			}))
			.pipe(babel())
			.pipe(add(`${PACKAGES_PATH}/*/package.json`))
			.pipe(gulp.dest(DIST_PATH));
	}

	function collectPackageDeps(done) {
		return gulp.src(`${PACKAGE_ROOT}/package.json`, { base: PACKAGE_ROOT })
			.pipe(through.obj((file, encoding, callback) => {
				const pkgJSON = JSON.parse(file.contents.toString('utf8'));
				const deps = pkgJSON['dependencies'] || (pkgJSON['dependencies'] = {});
				const devDeps = pkgJSON['devDependencies'] || (pkgJSON['devDependencies'] = {});

				gulp.src(`${PACKAGES_PATH}/*/package.json`)
					.pipe(through.obj((file, encoding, callback) => {
						const pkgJSON = JSON.parse(file.contents.toString('utf8'));
						Object.assign(deps, pkgJSON['dependencies']);
						Object.assign(devDeps, pkgJSON['devDependencies']);
						callback(null, file);
					}, (callback_) => {
						file.contents = new Buffer(JSON.stringify(pkgJSON, null, '  '), 'utf8');
						callback_();
						callback(null, file);
					}))
			}))
			.pipe(gulp.dest(PACKAGE_ROOT));
	}
}

function entry(done) {
	'use strict';

	const stream = require('stream');
	const pass = stream.PassThrough();
	const fs = require('fs');
	const path = require('path');
	const makeVinylStream = require('vinyl-source-stream');

	fs.readdir(DIST_PATH, (error, files) => {
		if (error) return console.error(error);

		const scripts = [];

		files.forEach((filename) => {
			let shouldRequireInEntry = false;
			try {
				require.resolve(path.resolve(DIST_PATH, filename));
				shouldRequireInEntry = true;
			} catch (e) {
			}
			if (!shouldRequireInEntry) return;

			const prefixTrimmed = PACKAGE_PREFIX ? filename.replace(PACKAGE_PREFIX, '') : filename;
			const key = prefixTrimmed.replace(/-([a-z])/g, (m, p1) => p1.toUpperCase());
			const script = `module.exports['${key}'] = require('./${filename}');`;
			scripts.push(script);
		});

		pass.end(new Buffer(scripts.join('\n'), 'utf8'));

		const out = pass.pipe(makeVinylStream(ENTRY_FILE))
			.pipe(gulp.dest(DIST_PATH));

		done(null, out);
	});
}

function basic(done) {
	const path = require('path');
	const browserify = require('browserify');
	const makeVinylStream = require('vinyl-source-stream');
	const browserifyConfig = require('../config/browserify');

	const options = Object.assign({}, browserifyConfig.basic);
	const outfile = options.outfile;
	delete options.outfile;

	return browserify(options)
		.bundle()
		.pipe(makeVinylStream(path.basename(outfile)))
		.pipe(gulp.dest(path.dirname(outfile)));
}

function min(done) {
	const path = require('path');
	const browserify = require('browserify');
	const uglify = require('gulp-uglify');
	const makeVinylStream = require('vinyl-source-stream');
	const makeVinylBuffer = require('vinyl-buffer');

	const browserifyConfig = require('../config/browserify');
	const uglifyConfig = require('../config/uglify');

	const options = Object.assign({}, browserifyConfig.min);
	const outfile = options.outfile;
	delete options.outfile;

	return browserify(options)
		.bundle()
		.pipe(makeVinylStream(path.basename(outfile)))
		.pipe(makeVinylBuffer())
		.pipe(uglify(uglifyConfig.basic))
		.pipe(gulp.dest(path.dirname(outfile)));
}
