import { createState, Store } from '@ngneat/elf';
import { selectAll, selectEntity, selectMany, setEntities, withEntities } from '@ngneat/elf-entities';
import { ServiceProvider } from '../models';

const { state, config } = createState(withEntities<ServiceProvider>());

const serviceProviderStore = new Store({ state, name: 'service-provider', config });

export class ServiceProviderRepository {
  serviceProviders$ = serviceProviderStore.pipe(selectAll());
  set(entities: ServiceProvider[]) {
    return serviceProviderStore.update(setEntities(entities));
  }
  getServiceProvider(providerId: number) {
    return serviceProviderStore.pipe(selectEntity(providerId));
  }
  getSubsetOfProviders(providerIds: number[]) {
    return serviceProviderStore.pipe(selectMany(providerIds));
  }
}
