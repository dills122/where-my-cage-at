import * as file from './file';

export { file };

export const LogToAllInterfaces = async (message: string, isError = false): Promise<void> => {
	await file.writeLogMessage(message);
	if (isError) {
		return console.error(message);
	}
	return console.log(message);
};
