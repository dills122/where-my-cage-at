'use strict';

module.exports = {
	hooks: {
		readPackage
	}
};

function readPackage(packageJson, context) {
	if (packageJson.name === '@angular/build' && packageJson.version === '21.2.20') {
		context.log('Disabling optional lmdb cache support because its native addon crashes on macOS');
		delete packageJson.optionalDependencies.lmdb;
	}

	return packageJson;
}
