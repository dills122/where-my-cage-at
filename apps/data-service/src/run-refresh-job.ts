interface RefreshResult {
	version: string;
	durationMs: number;
}

interface JobLogger {
	log(message: string): void;
	error(message: string): void;
}

export async function runRefreshJob(refresh: () => Promise<RefreshResult>, logger: JobLogger = console) {
	logger.log(JSON.stringify({ event: 'catalogue_refresh_job_started' }));
	try {
		const status = await refresh();
		logger.log(
			JSON.stringify({
				event: 'catalogue_refresh_job_completed',
				version: status.version,
				durationMs: status.durationMs
			})
		);
		return 0;
	} catch (error) {
		logger.error(
			JSON.stringify({
				event: 'catalogue_refresh_job_failed',
				message: error instanceof Error ? error.message : String(error)
			})
		);
		return 1;
	}
}
