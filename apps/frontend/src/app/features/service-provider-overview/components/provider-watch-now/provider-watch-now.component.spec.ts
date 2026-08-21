import { createOffer } from 'src/testing/fixtures';
import { ProviderWatchNowComponent } from './provider-watch-now.component';

describe('ProviderWatchNowComponent', () => {
	it('filters offers for the selected provider and labels them', () => {
		const component = new ProviderWatchNowComponent();
		component.providerId = 8;
		component.offers = [
			createOffer({ providerId: 8, monetizationType: 'flatrate', presentationType: 'hd' }),
			createOffer({ providerId: 15, monetizationType: 'rent' })
		];

		component.ngOnInit();

		expect(component.offersForProvider).toEqual([component.offers[0]]);
		expect(component.createLabelName('flatrate', 'hd')).toBe('Stream Now · HD');
		expect(component.createLabelName('flatrate', '_4k')).toBe('Stream Now · 4K');
	});

	it('shows real prices for rentals and purchases only', () => {
		const component = new ProviderWatchNowComponent();
		const rental = createOffer({ monetizationType: 'rent', retailPrice: 4.99, currency: 'USD' });
		const subscription = createOffer({ monetizationType: 'flatrate', retailPrice: 9.99, currency: 'USD' });

		expect(component.shouldShowPrice(rental)).toBeTrue();
		expect(component.formatPrice(rental)).toBe('$4.99');
		expect(component.shouldShowPrice(subscription)).toBeFalse();
	});

	it('opens valid watch links and ignores missing ones', () => {
		const component = new ProviderWatchNowComponent();
		const open = spyOn(window, 'open');

		component.openExternalLink({});
		component.openExternalLink({ standardWeb: 'https://example.com/watch' });

		expect(open).toHaveBeenCalledOnceWith('https://example.com/watch', '_blank', 'noopener,noreferrer');
	});
});
