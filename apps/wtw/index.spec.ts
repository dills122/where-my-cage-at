import { expect } from 'chai';
import { readFileSync } from 'fs';
import got from 'got';
import { describe } from 'mocha';
import { join } from 'path';
import { of } from 'rxjs';
import Sinon from 'sinon';
import WTW, { ObjectSearchResult, ServiceProvider } from './index';

function loadFixture(name: string) {
	return JSON.parse(readFileSync(join(__dirname, 'test-fixtures', name), 'utf8'));
}

function graphqlNode({
	id,
	title,
	objectType = 'MOVIE',
	tmdbId,
	imdbId = 'tt0000001',
	offers = []
}: {
	id: string;
	title: string;
	objectType?: 'MOVIE' | 'SHOW';
	tmdbId?: string | null;
	imdbId?: string | null;
	offers?: any[];
}) {
	return {
		id,
		objectType,
		content: {
			title,
			originalReleaseYear: 2024,
			fullPath: `/us/movie/${title.toLowerCase().replace(/\s/g, '-')}`,
			shortDescription: `${title} description`,
			ageCertification: 'PG-13',
			externalIds: {
				imdbId,
				tmdbId
			}
		},
		offers
	};
}

function graphqlPage(nodes: any[], hasNextPage = false, endCursor: string | null = null) {
	return {
		searchTitles: {
			pageInfo: {
				hasNextPage,
				endCursor
			},
			edges: nodes.map(node => ({ node }))
		}
	};
}

describe('WTW::', () => {
	describe('getProviders::', () => {
		const stubs: any = {};
		let sandbox: Sinon.SinonSandbox;
		const responseMock = [] as ServiceProvider[];
		describe('Get::', () => {
			beforeEach(() => {
				sandbox = Sinon.createSandbox();
				stubs.requestStub = sandbox.stub(WTW.prototype as any, 'request').returns(of(responseMock));
			});
			afterEach(() => {
				sandbox.reset();
				sandbox.restore();
			});
			it('should return empty array if no providers are found', async () => {
				const api = new WTW();
				const results = await api.getProviders();
				expect(results).to.be.an('array').and.length(0);
				expect(stubs.requestStub.callCount).to.equal(1);
			});

			it('should return service provider if found', async () => {
				const api = new WTW();
				stubs.requestStub.returns(
					of([
						{
							id: 1
						} as ServiceProvider
					])
				);
				const results = await api.getProviders();
				const [first] = results;
				expect(results).to.be.an('array').and.length(1);
				expect(first.id).to.be.an('number').and.equal(1);
				expect(stubs.requestStub.callCount).to.equal(1);
			});
		});
	});

	describe('getPersonsFilmography::', () => {
		let sandbox: Sinon.SinonSandbox;

		beforeEach(() => {
			sandbox = Sinon.createSandbox();
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('paginates GraphQL results and maps movie ids and offers', async () => {
			const graphqlRequestStub = sandbox.stub(WTW.prototype as any, 'graphqlRequest');
			graphqlRequestStub.onFirstCall().resolves(loadFixture('filmography-page-1.json'));
			graphqlRequestStub.onSecondCall().resolves(loadFixture('filmography-page-2.json'));

			const api = new WTW();
			api.locale = 'en_CA';
			const results = await api.getPersonsFilmography({ personId: 6747, pageSize: 25 });

			expect(results).to.have.length(2);
			expect(results.map((movie: ObjectSearchResult) => movie.id)).to.deep.equal([10, 22]);
			expect(results[1]).to.deep.include({ title: '', shortDescription: '', ageCertification: '' });
			expect(results[0].offers[0]).to.deep.include({
				providerId: 8,
				monetizationType: 'flatrate',
				presentationType: 'hd',
				retailPrice: 0,
				currency: 'CAD',
				country: 'CA'
			});
			expect(results[0].offers[0].urls).to.deep.equal({
				standardWeb: 'https://example.com/watch',
				standard_web: 'https://example.com/watch',
				deeplink: 'example://watch'
			});
			expect(graphqlRequestStub.callCount).to.equal(2);

			const firstVariables = graphqlRequestStub.firstCall.args[0].variables;
			expect(firstVariables).to.deep.include({
				country: 'CA',
				language: 'en',
				first: 25,
				after: null,
				location: 'SearchPage'
			});
			expect(firstVariables.filter).to.deep.include({
				personId: 'tp6747',
				includeTitlesWithoutUrl: true,
				isUpcoming: false,
				objectTypes: ['MOVIE']
			});
			expect(graphqlRequestStub.secondCall.args[0].variables.after).to.equal('next-page');
		});

		it('respects the page limit and applies the local title query', async () => {
			const graphqlRequestStub = sandbox
				.stub(WTW.prototype as any, 'graphqlRequest')
				.resolves(
					graphqlPage(
						[
							graphqlNode({ id: 'tm1', title: 'The Match', tmdbId: '1' }),
							graphqlNode({ id: 'tm2', title: 'Another Movie', tmdbId: '2' })
						],
						true,
						'unused-next-page'
					)
				);

			const api = new WTW();
			const results = await api.getPersonsFilmography({
				personId: 6747,
				pages: 1,
				query: 'match',
				majorProjectsOnly: false
			});

			expect(results.map((movie: ObjectSearchResult) => movie.title)).to.deep.equal(['The Match']);
			expect(graphqlRequestStub.callCount).to.equal(1);
			expect(graphqlRequestStub.firstCall.args[0].variables.filter).to.deep.equal({
				personId: 'tp6747',
				includeTitlesWithoutUrl: true,
				isUpcoming: false
			});
		});

		it('surfaces GraphQL schema errors instead of returning partial data', async () => {
			sandbox.stub(got, 'post').resolves({
				body: {
					errors: [{ message: 'Cannot query field "offers" on type "Movie"' }]
				}
			} as any);
			const api = new WTW();

			let error: Error | undefined;
			try {
				await (api as any).graphqlRequest({ query: 'query', variables: {} });
			} catch (err) {
				error = err as Error;
			}

			expect(error?.message).to.equal('Cannot query field "offers" on type "Movie"');
		});

		it('rejects a GraphQL response with no data payload', async () => {
			sandbox.stub(got, 'post').resolves({ body: {} } as any);
			const api = new WTW();

			let error: Error | undefined;
			try {
				await (api as any).graphqlRequest({ query: 'query', variables: {} });
			} catch (err) {
				error = err as Error;
			}

			expect(error?.message).to.equal('JustWatch GraphQL returned no data');
		});
	});
});
