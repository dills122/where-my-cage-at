import refresh from './src/refresh-redis-data';
import { runRefreshJob } from './src/run-refresh-job';

void runRefreshJob(refresh).then(exitCode => {
	process.exitCode = exitCode;
});
