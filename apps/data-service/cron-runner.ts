import refresh from './src/refresh-redis-data';
import cron from 'node-cron';
import express from 'express';
import * as dotenv from 'dotenv';
import { LogToAllInterfaces } from './src/logger';

dotenv.config({ path: __dirname + '/.env' });

const PORT = process.env.CRON_PORT || 3001;

const app = express();

// //Runs at 4:35 AM Everyday.
// cron.schedule('35 4 * * *', async () => {
// 	try {
// 		await LogToAllInterfaces('Data Services for the 4:35 AM timeslot started');
// 		await refresh();
// 		await LogToAllInterfaces('Finished running data refresh service');
// 	} catch (err) {
// 		await LogToAllInterfaces('Data Services for the 4:35 AM timeslot finished with ERRORS');
// 		console.error(err);
// 	} finally {
// 		await LogToAllInterfaces('Finished running all CRON services for 4:35 AM UTC timeslot');
// 	}
// });

cron.schedule('*/5 * * * *', async () => {
	try {
		await LogToAllInterfaces('Data Services for every 5th minute timeslot has started');
		await refresh();
		await LogToAllInterfaces('Finished running data refresh service');
	} catch (err) {
		await LogToAllInterfaces('Data Services for for every 5th minute timeslot finished with ERRORS');
		console.error(err);
	} finally {
		await LogToAllInterfaces('Finished running all CRON services for for every 5th minute timeslot');
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
