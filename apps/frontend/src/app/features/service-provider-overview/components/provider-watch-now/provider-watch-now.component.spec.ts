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
		expect(component.createLabelName('flatrate', 'hd')).toBe('Stream Now:HD');
	});

	it('opens valid watch links and ignores missing ones', () => {
		const component = new ProviderWatchNowComponent();
		const open = spyOn(window, 'open');

		component.openExternalLink({});
		component.openExternalLink({ standardWeb: 'https://example.com/watch' });

		expect(open).toHaveBeenCalledOnceWith('https://example.com/watch', '_blank');
	});
});
