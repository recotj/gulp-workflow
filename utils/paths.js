const Path = require('path');

const PosixPathSep = Path.posix.sep;
const Win32PathSep = Path.win32.sep;

const isWin32 = (Path.win32 === Path);

module.exports.replace = replace;
module.exports.toPosixPath = toPosixPath;
module.exports.toWin32Path = toWin32Path;

function replace(path, pattern, replacement) {
	path = toPosixPath(path);
	path = path.replace(pattern, replacement);

	if (isWin32) return toWin32Path(path);
	return path;
}

function toPosixPath(path) {
	checkArg(path);
	if (!path) return '/';
	return path.split(Win32PathSep).join(PosixPathSep);
}

function toWin32Path(path) {
	checkArg(path);
	if (!path) return '/';
	return path.split(PosixPathSep).join(PosixPathSep);
}

function checkArg(path) {
	if (typeof path !== 'string') throw new TypeError(`Path must be a string. Received ${path}`);
}
