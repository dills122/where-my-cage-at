import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourceDirectory = resolve(frontendRoot, '../../data/icons');
const targetDirectory = resolve(frontendRoot, 'src/assets/icons');
const icons = (await readdir(sourceDirectory, { withFileTypes: true }))
	.filter(entry => entry.isFile() && entry.name.endsWith('.webp'))
	.map(entry => entry.name)
	.sort();

if (icons.length === 0) {
	throw new Error(`No provider icons were found in ${sourceDirectory}`);
}

await mkdir(targetDirectory, { recursive: true });
await Promise.all(
	icons.map(icon => copyFile(resolve(sourceDirectory, icon), resolve(targetDirectory, basename(icon))))
);

console.log(`Synchronized ${icons.length} provider icons.`);
