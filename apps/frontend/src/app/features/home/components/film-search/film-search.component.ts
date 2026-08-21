import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Fuse from 'fuse.js';
import { AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { filter, map, Subject, take, takeUntil, tap } from 'rxjs';
import { FilmographyRepository } from 'src/app/repositories';

export interface FilmSearchResult {
	title: string;
	id: number;
	poster: string;
	originalReleaseYear: number;
}

@Component({
	selector: 'app-film-search',
	templateUrl: './film-search.component.html',
	styleUrls: ['./film-search.component.scss'],
	standalone: false
})
export class FilmSearchComponent implements OnInit, OnDestroy {
	text: string = '';
	results: FilmSearchResult[] = [];
	searchDictonary: FilmSearchResult[] = [];
	notifier = new Subject();
	searchResults$ = this.filmographyRepository.credits$.pipe(
		takeUntil(this.notifier),
		filter(records => records.length > 0),
		map(records =>
			records.map(({ id, title, poster, originalReleaseYear }) => ({
				id,
				title,
				poster,
				originalReleaseYear
			}))
		),
		tap(records => {
			this.searchDictonary = records;
		}),
		take(1)
	);

	constructor(
		private filmographyRepository: FilmographyRepository,
		private router: Router
	) {}

	ngOnDestroy(): void {
		this.notifier.next(true);
		this.notifier.complete();
	}

	ngOnInit(): void {
		this.searchResults$.subscribe();
	}

	search(event: AutoCompleteCompleteEvent) {
		const query = event.query;
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

	navigate(event: AutoCompleteSelectEvent) {
		const selectedFilm = event.value as FilmSearchResult;
		this.router.navigate([`/film-overview/${selectedFilm.id}`]);
	}
}
