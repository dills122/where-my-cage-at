import fs from 'fs';
import path from 'path';

const logsLocation = path.join(__dirname + 'logs.txt');

export const writeLogMessage = async (logMessage: string) => {
	const formattedMessage = `${new Date().toISOString()}:   ${logMessage}\n`;
	try {
		return await fs.promises.appendFile(logsLocation, formattedMessage);
	} catch (err) {
		console.error(err);
	}
};
