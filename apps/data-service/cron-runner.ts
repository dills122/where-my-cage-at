import refresh from './src/refresh-redis-data';
import cron from 'node-cron';
import express from 'express';
import * as dotenv from 'dotenv';
import { file } from './src/logger';

dotenv.config({ path: __dirname + '/.env' });

const PORT = process.env.CRON_PORT || 3001;

const app = express();

//Runs at 4:35 AM Everyday.
cron.schedule('35 4 * * *', () => {
	Promise.all([file.writeLogMessage('Data Services for the 4:35 AM time block started'), refresh()])
		.then(() => {
			console.log('Finished running service');
		})
		.catch(err => {
			console.error('Finished running with errors');
			console.error(err);
		});
});

app.listen(Number(PORT), async () => {
	let logMessage = 'Data Service Server Started';
	console.log(logMessage);
	await file.writeLogMessage(logMessage);
	try {
		logMessage = 'Initial Pod Spin Up. Running Redis Refresher';
		console.log(logMessage);
		await file.writeLogMessage(logMessage);
		await refresh();
	} catch (err) {
		logMessage = 'Finished running with errors';
		await file.writeLogMessage(logMessage);
		console.error(logMessage);
		console.error(err);
	}
});
