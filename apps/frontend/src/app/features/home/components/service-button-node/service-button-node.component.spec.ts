import { Router } from '@angular/router';
import { SEE_MORE_SERVICE_ID } from '../../services';
import { ServiceButtonNodeComponent } from './service-button-node.component';

describe('ServiceButtonNodeComponent', () => {
	it('routes provider buttons and the see-more button to their destinations', () => {
		const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
		const component = new ServiceButtonNodeComponent(router);

		component.serviceId = 8;
		component.openServicePage(8);
		component.serviceId = SEE_MORE_SERVICE_ID;
		component.openServicePage(SEE_MORE_SERVICE_ID);

		expect(router.navigate.calls.allArgs()).toEqual([
			[['/service-provider-overview/8']],
			[['/available-service-providers']]
		]);
	});
});
