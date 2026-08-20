import { createState, Store } from '@ngneat/elf';
import {
	selectAllEntities,
	selectEntity,
	selectEntityByPredicate,
	selectMany,
	setEntities,
	withEntities
} from '@ngneat/elf-entities';
import { EMPTY, of, switchMap } from 'rxjs';
import { ServiceProvider } from '../models';

const { state, config } = createState(withEntities<ServiceProvider>());

export const serviceProviderStore = new Store({ state, name: 'service-provider', config });

export class ServiceProviderRepository {
	initialized$ = of(true);
	serviceProviders$ = serviceProviderStore.pipe(selectAllEntities());

	set(entities: ServiceProvider[]) {
		serviceProviderStore.update(setEntities(entities));
	}
	getServiceProviderById(providerId: number) {
		return serviceProviderStore.pipe(
			selectEntity(providerId),
			switchMap(provider => {
				if (provider === undefined) {
					return EMPTY;
				}
				return of(provider);
			})
		);
	}
	getServiceProviderByName(proivderName: string) {
		return serviceProviderStore.pipe(
			selectEntityByPredicate(provider => provider.clearName.toLowerCase() === proivderName.toLowerCase()),
			switchMap(provider => {
				if (provider === undefined) {
					return EMPTY;
				}
				return of(provider);
			})
		);
	}
	getSubsetOfProviders(providerIds: number[]) {
		return serviceProviderStore.pipe(selectMany(providerIds));
	}
}
