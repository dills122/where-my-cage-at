import { createState, Store } from '@ngneat/elf';
import { createRequestsCacheOperator, updateRequestCache, withRequestsCache } from '@ngneat/elf-requests';
import { selectAll, selectEntity, selectMany, setEntities, withEntities } from '@ngneat/elf-entities';
import { ServiceProvider } from '../models';

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
  getServiceProvider(providerId: number) {
    return serviceProviderStore.pipe(selectEntity(providerId));
  }
  getSubsetOfProviders(providerIds: number[]) {
    return serviceProviderStore.pipe(selectMany(providerIds));
  }
}
