import { createState, Store } from '@ngneat/elf';
import { createRequestsCacheOperator, updateRequestCache, withRequestsCache } from '@ngneat/elf-requests';
import {
  selectAll,
  selectEntity,
  selectEntityByPredicate,
  selectMany,
  setEntities,
  withEntities
} from '@ngneat/elf-entities';
import { ServiceProvider } from '../models';
import { EMPTY, filter, of, switchMap } from 'rxjs';

const { state, config } = createState(
  withEntities<ServiceProvider>(),
  withRequestsCache<'service-provider'>()
);

export const serviceProviderStore = new Store({ state, name: 'service-provider', config });

export const skipServiceProviderWhileCached = createRequestsCacheOperator(serviceProviderStore);

export class ServiceProviderRepository {
  serviceProviders$ = serviceProviderStore.pipe(selectAll());

  set(entities: ServiceProvider[]) {
    serviceProviderStore.update(updateRequestCache('service-provider'), setEntities(entities));
  }
  getServiceProviderById(providerId: number) {
    return serviceProviderStore.pipe(
      selectEntity(providerId),
      switchMap((provider) => {
        if (provider === undefined) {
          return EMPTY;
        }
        return of(provider);
      })
    );
  }
  getServiceProviderByName(proivderName: string) {
    return serviceProviderStore.pipe(
      selectEntityByPredicate((provider) => provider.clearName.toLowerCase() === proivderName.toLowerCase()),
      switchMap((provider) => {
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
