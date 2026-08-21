import type { MovieRecord } from '../../src/app/models';

describe('Where My Cage At local stack', () => {
	it('loads catalog data and opens a film from search', () => {
		cy.intercept('GET', '/assets/catalogue/filmography.json').as('filmography');
		cy.intercept('GET', '/assets/catalogue/service-providers.json').as('serviceProviders');

		cy.visit('/');
		cy.wait(['@filmography', '@serviceProviders']);
		cy.contains('This movie night, make it a Nick-casion.');
		cy.get('.providers__grid app-service-icon img')
			.should('have.length', 3)
			.each(image => {
				cy.wrap(image)
					.should('be.visible')
					.and(($image: JQuery<HTMLImageElement>) => {
						expect($image[0].naturalWidth).to.be.greaterThan(0);
					});
			});

		cy.get('p-autocomplete input').type('Longlegs');
		cy.get('.film-search__result app-movie-poster img')
			.should('be.visible')
			.and(($image: JQuery<HTMLImageElement>) => {
				expect($image[0].naturalWidth).to.be.greaterThan(0);
			});
		cy.contains('.p-autocomplete-option', 'Longlegs').click();

		cy.location('pathname').should('match', /^\/film-overview\/\d+$/);
		cy.contains('h1', 'Longlegs');
		cy.contains('h2', 'Viewing options');
		cy.get('.film-detail__intro app-movie-poster img')
			.should('be.visible')
			.and(($image: JQuery<HTMLImageElement>) => {
				expect($image[0].naturalWidth).to.be.greaterThan(0);
			});
		cy.get('app-service-icon img').each(image => {
			cy.wrap(image).should(($image: JQuery<HTMLImageElement>) => {
				expect($image[0].naturalWidth).to.be.greaterThan(0);
			});
		});
	});

	it('organizes the available providers and opens one', () => {
		cy.intercept('GET', '/assets/catalogue/filmography.json').as('filmography');
		cy.intercept('GET', '/assets/catalogue/service-providers.json').as('serviceProviders');

		cy.visit('/available-service-providers');
		cy.wait(['@filmography', '@serviceProviders']);
		cy.contains('h1', 'All available providers');
		cy.get('.provider-index__summary').should('contain.text', 'ways to watch');
		cy.contains('h2', 'Streaming subscriptions');
		cy.contains('h2', 'Channel add-ons');
		cy.contains('h3', 'Prime Video Channels');
		cy.contains('.service-icon__note', 'Add-on via Amazon');
		cy.get('.provider-index__grid app-service-icon button')
			.should('have.length.greaterThan', 0)
			.first()
			.click();

		cy.location('pathname').should('match', /^\/service-provider-overview\/\d+$/);
		cy.get('.provider-detail__stat strong').invoke('text').should('match', /^\d+$/);
		cy.contains('h2', 'Available titles');
		cy.get('.film-record__summary app-movie-poster img')
			.first()
			.should('be.visible')
			.and(($image: JQuery<HTMLImageElement>) => {
				expect($image[0].naturalWidth).to.be.greaterThan(0);
			});
		cy.get('.film-record__summary').first().click();
		cy.contains('h3', 'Quick facts');
		cy.contains('h3', 'Watch options');
	});

	it('loads a film detail route directly', () => {
		cy.request<MovieRecord[]>('/assets/catalogue/filmography.json').then(({ body }) => {
			const film = body.find(record => record.offers.length > 0);
			expect(film, 'film with viewing options').to.exist;

			if (!film) {
				throw new Error('Expected the seeded catalogue to include a film with viewing options.');
			}

			cy.visit(`/film-overview/${film.id}`);
			cy.contains('h1', film.title);
			cy.contains('h2', 'Viewing options');
			cy.get('.viewing-group__providers button').should('have.length.greaterThan', 0);
		});
	});
});
