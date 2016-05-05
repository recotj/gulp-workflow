const gulp = require('gulp');

module.exports.modules = modules;
module.exports.basic = basic;
module.exports.min = min;

function modules(done) {
	const path = require('path');
	const plumber = require('gulp-plumber');
	const through = require('through2');
	const babel = require('gulp-babel');

	const base = path.resolve(SRC_PATH);
	const entry = path.resolve(SRC_PATH, ENTRY_FILE);

	return gulp.src('**/*.js', { base: base })
		.pipe(plumber({
			errorHandler(err) {
				gutil.log(err.stack);
			}
		}))
		.pipe(babel())
		.pipe(through((file, encoding, callback) => {
			if (file.path === entry) {
				file.path = path.resolve(DIST_PATH, 'entry.js');
			}
			callback(null, file);
		}))
		.pipe(gulp.dest(DIST_PATH));
}

function basic(done) {
	const path = require('path');
	const browserify = require('browserify');
	const makeVinylStream = require('vinyl-source-stream');
	const browserifyConfig = require('../config/browserify');

	const options = Object.assign({}, browserifyConfig.basic, {entries: ['entry.js']});
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

	const options = Object.assign({}, browserifyConfig.min, {entries: ['entry.js']});
	const outfile = options.outfile;
	delete options.outfile;

	return browserify(options)
		.bundle()
		.pipe(makeVinylStream(path.basename(outfile)))
		.pipe(makeVinylBuffer())
		.pipe(uglify(uglifyConfig.basic))
		.pipe(gulp.dest(path.dirname(outfile)));
}
