import { createState, Store } from '@ngneat/elf';
import {
  selectAll,
  selectEntity,
  selectEntityByPredicate,
  selectMany,
  setEntities,
  withEntities
} from '@ngneat/elf-entities';
import { localStorageStrategy, persistState } from '@ngneat/elf-persist-state';
import { createRequestsCacheOperator, updateRequestCache, withRequestsCache } from '@ngneat/elf-requests';
import { EMPTY, of, switchMap } from 'rxjs';
import { ServiceProvider } from '../models';

const storeName = 'service-provider';

const { state, config } = createState(
  withEntities<ServiceProvider>(),
  withRequestsCache<'service-provider'>()
);

export const serviceProviderStore = new Store({ state, name: storeName, config });

export const serviceProviderPersist = persistState(serviceProviderStore, {
  key: storeName,
  storage: localStorageStrategy
});

export const skipServiceProviderWhileCached = createRequestsCacheOperator(serviceProviderStore);

export class ServiceProviderRepository {
  initialized$ = serviceProviderPersist.initialized$;
  serviceProviders$ = serviceProviderStore.pipe(selectAll());

  set(entities: ServiceProvider[]) {
    serviceProviderStore.update(
      updateRequestCache(storeName, {
        value: 'full'
      }),
      setEntities(entities)
    );
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
