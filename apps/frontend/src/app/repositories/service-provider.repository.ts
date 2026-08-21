import { toObservable } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { filter, map, of } from 'rxjs';
import { ServiceProvider } from '../models';

interface ServiceProviderState {
	serviceProviders: ServiceProvider[];
}

const initialState: ServiceProviderState = {
	serviceProviders: []
};

/** Application-scoped provider catalogue state backed by NgRx SignalStore. */
export const ServiceProviderRepository = signalStore(
	withState(initialState),
	withProps(store => ({
		serviceProviders$: toObservable(store.serviceProviders),
		initialized$: of(true)
	})),
	withMethods(store => ({
		set(serviceProviders: ServiceProvider[]): void {
			patchState(store, { serviceProviders: [...serviceProviders] });
		},
		getServiceProviderById(providerId: number) {
			return store.serviceProviders$.pipe(
				map(providers => providers.find(provider => provider.id === providerId)),
				filter((provider): provider is ServiceProvider => provider !== undefined)
			);
		},
		getServiceProviderByName(providerName: string) {
			return store.serviceProviders$.pipe(
				map(providers =>
					providers.find(provider => provider.clearName.toLowerCase() === providerName.toLowerCase())
				),
				filter((provider): provider is ServiceProvider => provider !== undefined)
			);
		},
		getSubsetOfProviders(providerIds: number[]) {
			const selectedIds = new Set(providerIds);
			return store.serviceProviders$.pipe(
				map(providers => providers.filter(provider => selectedIds.has(provider.id)))
			);
		}
	}))
);

export type ServiceProviderRepository = InstanceType<typeof ServiceProviderRepository>;
