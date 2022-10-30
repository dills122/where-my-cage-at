import refresh from './src/refresh-redis-data';
import cron from 'node-cron';
import express from 'express';
import * as dotenv from 'dotenv';
import { LogToAllInterfaces } from './src/logger';

dotenv.config({ path: __dirname + '/.env' });

const PORT = process.env.CRON_PORT || 3001;

const app = express();

//Runs every 12 hours
cron.schedule('0 */12 * * *', async () => {
	try {
		await LogToAllInterfaces('CRON for every 12th hour has started executing its services');
		await refresh();
		await LogToAllInterfaces('Finished running data refresh service');
	} catch (err) {
		await LogToAllInterfaces('CRON for every 12th hour has finished executing its services with ERRORS');
		console.error(err);
	} finally {
		await LogToAllInterfaces('CRON for every 12th hour has finished executing its services');
	}
});

app.listen(Number(PORT), async () => {
	await LogToAllInterfaces('Data Service Server Started');
	try {
		await LogToAllInterfaces('Initial Pod Spin Up. Running Redis Refresher');
		await refresh();
	} catch (err) {
		await LogToAllInterfaces('Finished running with errors', true);
		console.error(err);
	}
});
