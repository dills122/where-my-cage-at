import refresh from './src/refresh-redis-data';
import cron from 'node-cron';
import express from 'express';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/.env' });

const PORT = process.env.CRON_PORT || 3001;

const app = express();

//Runs at 4:35 AM Everyday.
cron.schedule('35 4 * * *', () => {
	Promise.all([refresh()])
		.then(() => {
			console.log('Finished running service');
		})
		.catch(err => {
			console.error('Finished running with errors');
			console.error(err);
		});
});

app.listen(Number(PORT), async () => {
	console.log('Data Service Server Started');
	try {
		console.log('Initial Pod Spin Up. Running Redis Refresher');
		await refresh();
	} catch (err) {
		console.error('Finished running with errors');
		console.error(err);
	}
});
