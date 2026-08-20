import { ServiceProvider } from 'src/app/models';

export type ProviderGroupKey = 'subscription' | 'channel' | 'free' | 'digital-store' | 'physical-store';
type ChannelHostKey = 'amazon' | 'apple' | 'roku';

export interface GroupedServiceProvider extends ServiceProvider {
	accessNote: string;
}

export interface ProviderCollection {
	key: string;
	title?: string;
	providers: GroupedServiceProvider[];
}

export interface ProviderGroup {
	key: ProviderGroupKey;
	title: string;
	description: string;
	providerCount: number;
	collections: ProviderCollection[];
}

export interface ProviderCatalogue {
	totalProviders: number;
	groups: ProviderGroup[];
}

interface ProviderGroupDefinition {
	key: ProviderGroupKey;
	title: string;
	description: string;
}

const GROUP_DEFINITIONS: ProviderGroupDefinition[] = [
	{
		key: 'subscription',
		title: 'Streaming subscriptions',
		description: 'Standalone apps and plans billed by the streaming service itself.'
	},
	{
		key: 'channel',
		title: 'Channel add-ons',
		description: 'Third-party subscriptions watched and billed through another streaming platform.'
	},
	{
		key: 'free',
		title: 'Free streaming',
		description: 'No recurring subscription—usually ad-supported, live, or available with a library card.'
	},
	{
		key: 'digital-store',
		title: 'Rent or buy',
		description: 'Digital storefronts where you pay for a title instead of a recurring plan.'
	},
	{
		key: 'physical-store',
		title: 'Buy on disc',
		description: 'Retailers selling DVD or Blu-ray copies.'
	}
];

const CHANNEL_HOSTS: Array<{ key: ChannelHostKey; title: string }> = [
	{ key: 'amazon', title: 'Prime Video Channels' },
	{ key: 'apple', title: 'Apple TV channels' },
	{ key: 'roku', title: 'Roku Premium Subscriptions' }
];

const PHYSICAL_STORE_TECHNICAL_NAMES = new Set(['amazondvdbr', 'barnesandnoble', 'gruv', 'zavvi']);
const LIBRARY_SERVICES = new Set(['hoopla', 'kanopy']);
const FREE_FIRST_SERVICES = new Set([...LIBRARY_SERVICES, 'tubitv', 'vixtv']);
const FREE_SERVICES_WITH_PAID_OPTION = new Set(['vixtv']);
const STREAMING_TYPES = new Set(['ads', 'fast', 'flatrate', 'free']);
const STORE_TYPES = new Set(['buy', 'rent']);

export function buildProviderCatalogue(providers: ServiceProvider[]): ProviderCatalogue {
	const providersByGroup = new Map<ProviderGroupKey, GroupedServiceProvider[]>(
		GROUP_DEFINITIONS.map(definition => [definition.key, []])
	);

	for (const provider of providers) {
		const normalizedProvider = normalizeProvider(provider);
		const key = classifyProvider(normalizedProvider);
		providersByGroup.get(key)?.push({
			...normalizedProvider,
			accessNote: describeAccess(normalizedProvider, key)
		});
	}

	const groups = GROUP_DEFINITIONS.map(definition => {
		const groupedProviders = providersByGroup.get(definition.key) ?? [];
		if (groupedProviders.length === 0) {
			return undefined;
		}

		const collections =
			definition.key === 'channel'
				? buildChannelCollections(groupedProviders)
				: [{ key: definition.key, providers: sortProviders(groupedProviders) }];

		return {
			...definition,
			providerCount: groupedProviders.length,
			collections
		};
	}).filter((group): group is ProviderGroup => group !== undefined);

	return {
		totalProviders: providers.length,
		groups
	};
}

function normalizeProvider(provider: ServiceProvider): ServiceProvider {
	return {
		...provider,
		clearName: provider.clearName.trim(),
		monetizationTypes: provider.monetizationTypes.map(type => type.toLowerCase())
	};
}

function classifyProvider(provider: ServiceProvider): ProviderGroupKey {
	if (getChannelHost(provider)) {
		return 'channel';
	}
	if (isPhysicalStore(provider)) {
		return 'physical-store';
	}
	if (isDigitalStore(provider)) {
		return 'digital-store';
	}
	if (isFreeService(provider)) {
		return 'free';
	}
	return 'subscription';
}

function getChannelHost(provider: ServiceProvider): ChannelHostKey | undefined {
	const name = provider.clearName.toLowerCase();
	const technicalName = provider.technicalName.toLowerCase();

	if (name.includes('amazon channel') || name.includes('amazon channels')) {
		return 'amazon';
	}
	if (name.includes('apple tv channel') || technicalName.startsWith('appletv')) {
		return 'apple';
	}
	if (name.includes('roku premium channel')) {
		return 'roku';
	}
	return undefined;
}

function isPhysicalStore(provider: ServiceProvider): boolean {
	return (
		PHYSICAL_STORE_TECHNICAL_NAMES.has(provider.technicalName.toLowerCase()) ||
		/dvd|blu-ray/i.test(provider.clearName)
	);
}

function isDigitalStore(provider: ServiceProvider): boolean {
	const hasStoreType = provider.monetizationTypes.some(type => STORE_TYPES.has(type));
	const hasStreamingType = provider.monetizationTypes.some(type => STREAMING_TYPES.has(type));
	return provider.clearName.toLowerCase().includes('store') || (hasStoreType && !hasStreamingType);
}

function isFreeService(provider: ServiceProvider): boolean {
	const types = new Set(provider.monetizationTypes);
	return (
		FREE_FIRST_SERVICES.has(provider.technicalName.toLowerCase()) ||
		(types.has('flatrate') === false && (types.has('ads') || types.has('fast') || types.has('free')))
	);
}

function describeAccess(provider: ServiceProvider, key: ProviderGroupKey): string {
	const types = new Set(provider.monetizationTypes);

	switch (key) {
		case 'channel': {
			const host = getChannelHost(provider);
			return `Add-on via ${host === 'amazon' ? 'Amazon' : host === 'apple' ? 'Apple TV' : host === 'roku' ? 'Roku' : 'platform'}`;
		}
		case 'physical-store':
			return 'DVD or Blu-ray';
		case 'digital-store':
			if (types.has('buy') && types.has('rent')) {
				return 'Rent or buy';
			}
			return types.has('rent') ? 'Rent online' : 'Buy online';
		case 'free':
			if (LIBRARY_SERVICES.has(provider.technicalName.toLowerCase())) {
				return 'Library access';
			}
			if (FREE_SERVICES_WITH_PAID_OPTION.has(provider.technicalName.toLowerCase())) {
				return 'Free · paid option';
			}
			if (types.has('fast')) {
				return 'Free live TV';
			}
			return types.has('ads') ? 'Free with ads' : 'Free';
		case 'subscription':
		default:
			if (provider.clearName.toLowerCase().includes('with ads')) {
				return 'Subscription · ads';
			}
			if (types.has('free')) {
				return 'Subscription · free option';
			}
			if (types.has('buy') || types.has('rent')) {
				return 'Subscription · rentals';
			}
			return 'Subscription';
	}
}

function buildChannelCollections(providers: GroupedServiceProvider[]): ProviderCollection[] {
	return CHANNEL_HOSTS.map(host => ({
		key: host.key,
		title: host.title,
		providers: sortProviders(providers.filter(provider => getChannelHost(provider) === host.key))
	})).filter(collection => collection.providers.length > 0);
}

function sortProviders(providers: GroupedServiceProvider[]): GroupedServiceProvider[] {
	return [...providers].sort((first, second) => first.clearName.localeCompare(second.clearName));
}
