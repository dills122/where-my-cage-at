import refresh from './src/refresh-redis-data';
import cron from 'node-cron';
import express from 'express';

const app = express();

//Runs at 4:35 AM Everyday.
cron.schedule('35 4 * * *', () => {
  Promise.all([refresh()])
    .then(() => {
      console.log('Finished running service');
    })
    .catch((err) => {
      console.error('Finished running with errors');
      console.error(err);
    });
});

app.listen(3000);
