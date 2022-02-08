import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Fuse from 'fuse.js';
import { map, mergeMap, of, Subject, switchMap, takeUntil, tap, toArray } from 'rxjs';
import { FilmographyRepository } from 'src/app/repositories';

export interface FilmSearchResult {
	title: string;
	id: number;
}

@Component({
	selector: 'app-film-search',
	templateUrl: './film-search.component.html',
	styleUrls: ['./film-search.component.scss']
})
export class FilmSearchComponent implements OnInit, OnDestroy {
	text: string = '';
	results: FilmSearchResult[] = [];
	searchDictonary: FilmSearchResult[] = [];
	notifier = new Subject();
	searchResults$ = this.filmographyRepository.credits$.pipe(
		takeUntil(this.notifier),
		switchMap(records => {
			return of(records).pipe(
				mergeMap(records => records),
				map(record => {
					const { id, title } = record;
					return {
						id,
						title
					} as FilmSearchResult;
				}),
				toArray()
			);
		}),
		tap(records => {
			this.searchDictonary = records;
		}),
		tap(() => {
			this.notifier.next(true);
		})
	);

	constructor(private filmographyRepository: FilmographyRepository, private router: Router) {}

	ngOnDestroy(): void {
		this.notifier.next(true);
		this.notifier.complete();
	}

	ngOnInit(): void {
		this.searchResults$.subscribe();
	}

	search(event: any) {
		let query = event.query;
		if (!query) {
			return;
		}
		const searcher = new Fuse(this.searchDictonary, {
			includeScore: false,
			keys: ['title']
		});
		const searchResults = searcher.search(query);
		this.results = searchResults.map(item => {
			return item.item;
		});
	}

	navigate(event: FilmSearchResult) {
		this.router.navigate([`/film-overview/${event.id}`]);
	}
}
