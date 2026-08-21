import { toObservable } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { filter, map, of } from 'rxjs';
import { MovieRecord } from '../models';

interface FilmographyState {
	credits: MovieRecord[];
}

const initialState: FilmographyState = {
	credits: []
};

/**
 * Application-scoped film catalogue state.
 *
 * The Observable properties keep the existing component API stable while the
 * signals are also public for new signal-native consumers.
 */
export const FilmographyRepository = signalStore(
	withState(initialState),
	withProps(store => ({
		credits$: toObservable(store.credits),
		initialized$: of(true)
	})),
	withMethods(store => ({
		set(credits: MovieRecord[]): void {
			patchState(store, { credits: [...credits] });
		},
		getCredit(creditId: number) {
			return store.credits$.pipe(
				map(credits => credits.find(credit => credit.id === creditId)),
				filter((credit): credit is MovieRecord => credit !== undefined)
			);
		},
		getAllCreditsByProviderId(providerId: number) {
			return store.credits$.pipe(
				map(credits =>
					credits.filter(credit => credit.offers?.some(offer => offer.providerId === providerId))
				)
			);
		}
	}))
);

export type FilmographyRepository = InstanceType<typeof FilmographyRepository>;
