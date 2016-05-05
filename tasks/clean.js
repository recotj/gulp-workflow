const del = require('del');

module.exports = (done) => {
	del(DIST_PATH)
		.then(paths => {
			paths.forEach(path => console.log('delete: %s', path.replace(__dirname, '')));
			done();
		});
};
