import { createServiceProvider } from 'src/testing/fixtures';
import { buildProviderCatalogue } from './provider-groups';

describe('buildProviderCatalogue', () => {
	it('separates direct subscriptions, free services, stores, and physical retailers', () => {
		const catalogue = buildProviderCatalogue([
			createServiceProvider({
				id: 8,
				technicalName: 'netflix',
				clearName: 'Netflix',
				monetizationTypes: ['flatrate']
			}),
			createServiceProvider({
				id: 73,
				technicalName: 'tubitv',
				clearName: 'Tubi TV',
				monetizationTypes: ['ads']
			}),
			createServiceProvider({
				id: 2,
				technicalName: 'itunes',
				clearName: 'Apple TV Store',
				monetizationTypes: ['buy', 'rent']
			}),
			createServiceProvider({
				id: 50,
				technicalName: 'amazondvdbr',
				clearName: 'Amazon DVD / Blu-ray',
				monetizationTypes: ['buy']
			})
		]);

		expect(catalogue.groups.map(group => group.key)).toEqual([
			'subscription',
			'free',
			'digital-store',
			'physical-store'
		]);
		expect(catalogue.groups.find(group => group.key === 'free')?.collections[0].providers[0].accessNote).toBe(
			'Free with ads'
		);
		expect(catalogue.totalProviders).toBe(4);
	});

	it('groups channel add-ons by the platform that bills them', () => {
		const catalogue = buildProviderCatalogue([
			createServiceProvider({ id: 528, technicalName: 'amazonamcplus', clearName: 'AMC+ Amazon Channel' }),
			createServiceProvider({
				id: 1854,
				technicalName: 'appletvamcplus',
				clearName: 'AMC Plus Apple TV Channel'
			}),
			createServiceProvider({
				id: 635,
				technicalName: 'rokuchannelamcplus',
				clearName: 'AMC+ Roku Premium Channel'
			})
		]);

		const channelGroup = catalogue.groups[0];
		expect(channelGroup.key).toBe('channel');
		expect(channelGroup.collections.map(collection => collection.title)).toEqual([
			'Prime Video Channels',
			'Apple TV channels',
			'Roku Premium Subscriptions'
		]);
		expect(channelGroup.collections.map(collection => collection.providers[0].accessNote)).toEqual([
			'Add-on via Amazon',
			'Add-on via Apple TV',
			'Add-on via Roku'
		]);
	});

	it('keeps library services in free streaming even when the source marks them as flat-rate', () => {
		const catalogue = buildProviderCatalogue([
			createServiceProvider({
				id: 191,
				technicalName: 'kanopy',
				clearName: 'Kanopy',
				monetizationTypes: ['flatrate', 'free']
			})
		]);

		expect(catalogue.groups[0].key).toBe('free');
		expect(catalogue.groups[0].collections[0].providers[0].accessNote).toBe('Library access');
	});

	it('does not mistake standalone services containing “Channel” for host-billed add-ons', () => {
		const catalogue = buildProviderCatalogue([
			createServiceProvider({
				id: 258,
				technicalName: 'criterionchannel',
				clearName: 'Criterion Channel',
				monetizationTypes: ['flatrate']
			}),
			createServiceProvider({
				id: 207,
				technicalName: 'rokuchannel',
				clearName: 'The Roku Channel',
				monetizationTypes: ['ads']
			})
		]);

		expect(catalogue.groups.map(group => group.key)).toEqual(['subscription', 'free']);
	});
});
