import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/.env' });

export default {
	JustWatchPersonId: 6747,
	tmdb: {
		apiKey: process.env.TMDB_KEY || '2f6f061b137d85ddfebf0ab5c37b262d'
	}
};
