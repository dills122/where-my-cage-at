import { createHash, randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { CataloguePublication, CatalogueRefreshStatus } from 'redis-sdk';
import { refreshCatalogue, RefreshDependencies } from './refresh-redis-data';

export const STATIC_CATALOGUE_SCHEMA_VERSION = 1 as const;

export interface StaticCatalogueArtifact {
	path: 'filmography.json' | 'service-providers.json';
	recordCount: number;
	sha256: string;
}

export interface StaticCatalogueManifest {
	schemaVersion: typeof STATIC_CATALOGUE_SCHEMA_VERSION;
	catalogueVersion: string;
	generatedAt: string;
	artifacts: StaticCatalogueArtifact[];
}

export interface StaticCatalogueFiles {
	filmography: string;
	serviceProviders: string;
	manifest: string;
}

export interface StaticPublicationOptions {
	/** Used by integration tests and deployment validation before the current catalogue is replaced. */
	beforePromote?: (stagingDirectory: string) => Promise<void>;
}

export type StaticRefreshDependencies = Omit<RefreshDependencies, 'redisClient' | 'refreshLock'>;

export function createStaticCatalogueFiles(publication: CataloguePublication): StaticCatalogueFiles {
	const filmography = serializeJson(publication.movies);
	const serviceProviders = serializeJson(publication.serviceProviders);
	const manifest: StaticCatalogueManifest = {
		schemaVersion: STATIC_CATALOGUE_SCHEMA_VERSION,
		catalogueVersion: publication.version,
		generatedAt: publication.status.completedAt,
		artifacts: [
			{
				path: 'filmography.json',
				recordCount: publication.movies.length,
				sha256: sha256(filmography)
			},
			{
				path: 'service-providers.json',
				recordCount: publication.serviceProviders.length,
				sha256: sha256(serviceProviders)
			}
		]
	};

	return {
		filmography,
		serviceProviders,
		manifest: serializeJson(manifest)
	};
}

export async function publishStaticCatalogue(
	outputDirectory: string,
	publication: CataloguePublication,
	options: StaticPublicationOptions = {}
): Promise<void> {
	if (!outputDirectory.trim()) {
		throw new Error('A static catalogue output directory is required');
	}

	const targetDirectory = path.resolve(outputDirectory);
	const parentDirectory = path.dirname(targetDirectory);
	const targetName = path.basename(targetDirectory);
	const publicationId = randomUUID();
	const stagingDirectory = path.join(parentDirectory, `.${targetName}.staging-${publicationId}`);
	const backupDirectory = path.join(parentDirectory, `.${targetName}.backup-${publicationId}`);
	const files = createStaticCatalogueFiles(publication);
	let previousCatalogueMoved = false;
	let promoted = false;

	await fs.mkdir(parentDirectory, { recursive: true });
	if (await pathExists(targetDirectory)) {
		await assertReplaceableCatalogue(targetDirectory);
	}
	try {
		await fs.mkdir(stagingDirectory);
		await Promise.all([
			fs.writeFile(path.join(stagingDirectory, 'filmography.json'), files.filmography, 'utf8'),
			fs.writeFile(path.join(stagingDirectory, 'service-providers.json'), files.serviceProviders, 'utf8'),
			fs.writeFile(path.join(stagingDirectory, 'catalogue-manifest.json'), files.manifest, 'utf8')
		]);

		await options.beforePromote?.(stagingDirectory);
		if (await pathExists(targetDirectory)) {
			await fs.rename(targetDirectory, backupDirectory);
			previousCatalogueMoved = true;
		}

		try {
			await fs.rename(stagingDirectory, targetDirectory);
			promoted = true;
		} catch (error) {
			if (previousCatalogueMoved) {
				await fs.rename(backupDirectory, targetDirectory);
				previousCatalogueMoved = false;
			}
			throw error;
		}

		if (previousCatalogueMoved) {
			previousCatalogueMoved = false;
			await fs.rm(backupDirectory, { recursive: true, force: true }).catch(() => undefined);
		}
	} finally {
		if (!promoted) {
			await fs.rm(stagingDirectory, { recursive: true, force: true }).catch(() => undefined);
		}
		if (previousCatalogueMoved && !(await pathExists(targetDirectory))) {
			await fs.rename(backupDirectory, targetDirectory);
		}
	}
}

export async function refreshStaticCatalogue(
	outputDirectory: string,
	dependencies: StaticRefreshDependencies = {},
	publicationOptions: StaticPublicationOptions = {}
): Promise<CatalogueRefreshStatus> {
	const publisher = {
		connect: async () => undefined,
		disconnect: async () => undefined,
		acquireRefreshLock: async () => failOnRedisLock(),
		extendRefreshLock: async () => failOnRedisLock(),
		releaseRefreshLock: async () => failOnRedisLock(),
		recordRefreshFailure: async () => undefined,
		publishCatalog: async (publication: CataloguePublication) =>
			publishStaticCatalogue(outputDirectory, publication, publicationOptions)
	};

	return refreshCatalogue({
		...dependencies,
		redisClient: publisher,
		refreshLock: { disabled: true }
	});
}

async function assertReplaceableCatalogue(targetDirectory: string) {
	try {
		const manifest = JSON.parse(
			await fs.readFile(path.join(targetDirectory, 'catalogue-manifest.json'), 'utf8')
		) as Partial<StaticCatalogueManifest>;
		if (manifest.schemaVersion === STATIC_CATALOGUE_SCHEMA_VERSION) {
			return;
		}
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT' && !(error instanceof SyntaxError)) {
			throw error;
		}
	}
	throw new Error(`Refusing to replace ${targetDirectory} because it is not a schema-v1 static catalogue`);
}

async function pathExists(targetPath: string) {
	try {
		await fs.lstat(targetPath);
		return true;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return false;
		}
		throw error;
	}
}

function serializeJson(value: unknown) {
	return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(value: string) {
	return createHash('sha256').update(value, 'utf8').digest('hex');
}

function failOnRedisLock(): never {
	throw new Error('The static catalogue publisher must not use a Redis refresh lock');
}
