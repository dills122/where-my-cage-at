import path from 'node:path';
import { runRefreshJob } from './src/run-refresh-job';
import { refreshStaticCatalogue } from './src/refresh-static-catalogue';

const outputArgument = process.argv.slice(2).find(argument => argument !== '--');
const outputDirectory = outputArgument || process.env.STATIC_CATALOGUE_OUTPUT_DIR;

if (!outputDirectory) {
	console.error('Usage: rushx refresh:static <output-directory> (or set STATIC_CATALOGUE_OUTPUT_DIR)');
	process.exitCode = 2;
} else {
	void runRefreshJob(() => refreshStaticCatalogue(path.resolve(outputDirectory))).then(exitCode => {
		process.exitCode = exitCode;
	});
}
