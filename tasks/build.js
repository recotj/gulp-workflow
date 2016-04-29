const path = require('path');
const gulp = require('gulp');

const PACKAGE_PREFIX = '';

const isWin32 = (path.win32 === path);
const srcEx = isWin32 ? /(packages\\[^\\]+)\\src\\/ : /(packages\/[^\/]+)\/src\//;
const libFragment = isWin32 ? '$1\\lib\\' : '$1/lib/';

const basic = (done) => {
	const browserify = require('browserify');
	const makeVinylStream = require('vinyl-source-stream');
	const browserifyConfig = require('../config/browserify');

	const {outfile, ...options} = browserifyConfig.basic;

	return browserify(options)
		.bundle()
		.pipe(makeVinylStream(path.basename(outfile)))
		.pipe(gulp.dest(path.dirname(outfile)));
};

const min = (done) => {
	const browserify = require('browserify');
	const uglify = require('gulp-uglify');
	const makeVinylStream = require('vinyl-source-stream');
	const makeVinylBuffer = require('vinyl-buffer');

	const browserifyConfig = require('../config/browserify');
	const uglifyConfig = require('../config/uglify');

	const {outfile, ...options} = browserifyConfig.min;

	return browserify(options)
		.bundle()
		.pipe(makeVinylStream(path.basename(outfile)))
		.pipe(makeVinylBuffer())
		.pipe(uglify(uglifyConfig.basic))
		.pipe(gulp.dest(path.dirname(outfile)));
};

const packages = (done) => {
	const plumber = require('gulp-plumber');
	const gutil = require('gulp-util');
	const newer = require('gulp-newer');
	const through = require('through2');
	const babel = require('gulp-babel');
	const chalk = require('chalk');

	return gulp.src(`${PACKAGES_PATH}/*/src/**/*.js`)
		.pipe(plumber({
			errorHandler(err) {
				gutil.log(err.stack);
			}
		}))
		.pipe(through.obj((file, enc, callback) => {
			file._path = file.path;
			file.path = file.path.replace(srcEx, libFragment);
			callback(null, file);
		}))
		.pipe(newer(PACKAGES_PATH))
		.pipe(through.obj((file, enc, callback) => {
			gutil.log('compiling', `'${chalk.cyan(file._path)}'...`);
			callback(null, file);
		}))
		.pipe(babel())
		.pipe(gulp.dest(PACKAGES_PATH));
};

const modules = (done) => {
	const plumber = require('gulp-plumber');
	const gutil = require('gulp-util');

	return gulp.src([`${PACKAGES_PATH}/*/lib/**/*.js`, `${PACKAGES_PATH}/*/package.json`])
		.pipe(plumber({
			errorHandler(err) {
				gutil.log(err.stack);
			}
		}))
		.pipe(gulp.dest(DIST_PATH));
};

const entry = (done) => {
	const stream = require('stream');
	const pass = stream.PassThrough();
	const fs = require('fs');
	const makeVinylStream = require('vinyl-source-stream');

	fs.readdir(DIST_PATH, (error, files) => {
		if (error) return console.error(error);
		const scripts = [];
		files.forEach((filename) => {
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
};

module.exports = {basic, min, packages, modules, entry};
