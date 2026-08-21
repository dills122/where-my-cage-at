import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Wrangler and OpenTofu share one static Worker contract', async () => {
	const wrangler = JSON.parse(await readFile('apps/frontend/wrangler.jsonc', 'utf8'));
	const variables = await readFile('infrastructure/variables.tf', 'utf8');
	const workerBlock = variables.match(/variable "worker_name" \{[\s\S]*?\n\}/)?.[0];
	const workerName = workerBlock?.match(/default\s*=\s*"([^"]+)"/)?.[1];

	assert.ok(workerName, 'worker_name must have a string default');
	assert.equal(wrangler.name, workerName);
	assert.equal(wrangler.workers_dev, false);
	assert.equal(wrangler.preview_urls, true);
	assert.deepEqual(wrangler.assets, {
		directory: './dist/frontend',
		not_found_handling: 'single-page-application'
	});
	assert.equal(wrangler.routes, undefined, 'OpenTofu owns custom domains and routes');
});

test('the frontend consumes an exact-byte, schema-v1 static catalogue', async () => {
	const source = await readFile('apps/frontend/src/app/data-access/static-catalogue-data-source.ts', 'utf8');
	const bootstrap = await readFile('apps/frontend/src/main.ts', 'utf8');
	const manifest = JSON.parse(
		await readFile('apps/frontend/src/assets/catalogue/catalogue-manifest.json', 'utf8')
	);

	assert.match(source, /CATALOGUE_BASE_URL = '\/assets\/catalogue'/);
	assert.match(source, /CATALOGUE_BASE_URL}\/filmography\.json/);
	assert.match(source, /CATALOGUE_BASE_URL}\/service-providers\.json/);
	assert.match(source, /shareReplay/);
	assert.match(bootstrap, /useClass: StaticCatalogueDataSource/);
	assert.doesNotMatch(bootstrap, /HttpCatalogueDataSource/);
	assert.equal(manifest.schemaVersion, 1);

	for (const artifact of manifest.artifacts) {
		const bytes = await readFile(`apps/frontend/src/assets/catalogue/${artifact.path}`);
		const records = JSON.parse(bytes.toString('utf8'));
		assert.equal(records.length, artifact.recordCount);
		assert.equal(createHash('sha256').update(bytes).digest('hex'), artifact.sha256);
	}
});

test('the production workflow deploys only reviewed master ancestors', async () => {
	const workflow = await readFile('.github/workflows/deploy-cloudflare.action.yml', 'utf8');
	const frontendPackage = JSON.parse(await readFile('apps/frontend/package.json', 'utf8'));

	for (const required of [
		/deployment_sha:/,
		/persist-credentials: false/,
		/fetch-depth: 0/,
		/merge-base --is-ancestor HEAD origin\/master/,
		/refresh:static \.\.\/frontend\/src\/assets\/catalogue/,
		/cloudflare:dry-run/,
		/cloudflare:deploy/,
		/wrangler deployments list --config wrangler\.jsonc --json/,
		/cancel-in-progress: false/,
		/CLOUDFLARE_DEPLOY_ENABLED/
	]) {
		assert.match(workflow, required);
	}

	assert.ok(
		workflow.indexOf('cloudflare:dry-run') < workflow.indexOf('cloudflare:deploy'),
		'Wrangler dry-run must happen before deployment'
	);
	assert.match(frontendPackage.scripts['cloudflare:deployments'], /wrangler deployments list/);
});
