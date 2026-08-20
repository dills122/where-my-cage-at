describe('Where My Cage At local stack', () => {
	it('loads catalog data and opens a film from search', () => {
		cy.intercept('GET', 'http://localhost:3000/filmography').as('filmography');
		cy.intercept('GET', 'http://localhost:3000/service-providers').as('serviceProviders');

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
		cy.contains('.p-autocomplete-option', 'Longlegs').click();

		cy.location('pathname').should('match', /^\/film-overview\/\d+$/);
		cy.contains('h1', 'Longlegs');
		cy.contains('h2', 'Viewing options');
		cy.get('app-service-icon img').each(image => {
			cy.wrap(image).should(($image: JQuery<HTMLImageElement>) => {
				expect($image[0].naturalWidth).to.be.greaterThan(0);
			});
		});
	});

	it('organizes the available providers and opens one', () => {
		cy.intercept('GET', 'http://localhost:3000/filmography').as('filmography');
		cy.intercept('GET', 'http://localhost:3000/service-providers').as('serviceProviders');

		cy.visit('/available-service-providers');
		cy.wait(['@filmography', '@serviceProviders']);
		cy.contains('h1', 'All available providers');
		cy.get('.provider-index__summary').should('contain.text', 'providers with Cage movies');
		cy.get('.provider-index__grid app-service-icon button')
			.should('have.length.greaterThan', 0)
			.first()
			.click();

		cy.location('pathname').should('match', /^\/service-provider-overview\/\d+$/);
	});

	it('loads a film detail route directly', () => {
		cy.visit('/film-overview/2039');

		cy.contains('h1', 'Moonstruck');
		cy.contains('h2', 'Viewing options');
		cy.get('.viewing-group__providers button').should('have.length.greaterThan', 0);
	});
});
