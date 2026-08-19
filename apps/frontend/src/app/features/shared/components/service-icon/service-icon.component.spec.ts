import { Router } from '@angular/router';
import { ServiceIconComponent } from './service-icon.component';

describe('ServiceIconComponent', () => {
	it('routes internal provider icons and opens external watch links safely', () => {
		const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
		const component = new ServiceIconComponent(router);
		const open = spyOn(window, 'open');
		component.serviceId = 8;

		component.openUrl();
		component.externalUrl = 'https://example.com/watch';
		component.openUrl();

		expect(router.navigate).toHaveBeenCalledOnceWith(['/service-provider-overview/8']);
		expect(open).toHaveBeenCalledOnceWith('https://example.com/watch', '_blank', 'noopener,noreferrer');
	});

	it('does not navigate when the icon is presentational', () => {
		const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
		const component = new ServiceIconComponent(router);
		component.interactive = false;

		component.openUrl();

		expect(router.navigate).not.toHaveBeenCalled();
	});

	it('uses the JustWatch icon fallback and hides an unrecoverable image', () => {
		const component = new ServiceIconComponent(jasmine.createSpyObj<Router>('Router', ['navigate']));
		component.providerIconUrl = '/icon/123/profile';
		const image = document.createElement('img');

		component.useProviderFallback({ target: image } as unknown as Event);
		expect(image.src).toContain('/images/icon/123/s100/icon.webp');

		component.providerIconUrl = null;
		component.useProviderFallback({ target: image } as unknown as Event);
		expect(image.hidden).toBeTrue();
	});
});
