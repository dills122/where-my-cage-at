import WTW from '@dills1220/wtw';
import { promisify } from 'node:util';
import stream from 'node:stream';
import fs from 'node:fs';
import got from 'got';
import path from 'node:path';

const pipeline = promisify(stream.pipeline);

export default async () => {
	try {
		console.log(`Starting Icon data gathering at: ${new Date().toISOString()}`);
		const wtw = new WTW();
		const serviceProviders = await wtw.getProviders();
		for (const provider of serviceProviders) {
			console.log(`Fetching icon for service: ${provider.clearName}`);
			if (!provider.iconUrl) {
				console.warn(`No icon url found for service: ${provider.clearName}`);
				continue;
			}
			try {
				const url = buildIconUrl(provider.iconUrl);
				await fetchAndDownloadIcon(url, `${provider.clearName.replace(/\s+/g, '-')}-${provider.id}`);
				console.log(`Retrieved and downloaded icon for service: ${provider.clearName}`);
			} catch (err) {
				console.error(err);
				continue;
			}
		}
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

function buildIconUrl(iconUrl: string) {
	const iconUrlParts = iconUrl.split('/');
	const iconId = iconUrlParts[2];
	if (!iconId) {
		throw Error('no id found in url');
	}
	return `https://www.justwatch.com/images/icon/${iconId}/s100/icon.webp`;
}

async function fetchAndDownloadIcon(url: string, serviceId: string) {
	await pipeline(
		got.stream(url),
		fs.createWriteStream(path.join(__dirname, '..', 'icons', `${serviceId}.webp`))
	);
}
