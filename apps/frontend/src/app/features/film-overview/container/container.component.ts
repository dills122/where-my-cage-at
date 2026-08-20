import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { MovieRecord } from 'src/app/models';
import { FilmographyService } from 'src/app/services/filmography/filmography.service';
import { MonetizationTypes } from '../../service-provider-overview/service-providers-monetization-types-mapping';

@Component({
	selector: 'app-film-overview-container',
	templateUrl: './container.component.html',
	styleUrls: ['./container.component.scss'],
	standalone: false
})
export class ContainerComponent implements OnInit {
	filmId: number;
	filmRecord$!: Observable<MovieRecord>;
	MonetizationTypes = MonetizationTypes;

	constructor(
		private filmographyService: FilmographyService,
		private route: ActivatedRoute
	) {
		this.filmId = Number(this.route.snapshot.paramMap.get('filmId') || '');
	}
	ngOnInit(): void {
		this.filmRecord$ = this.filmographyService.getFilmographyCredit(this.filmId);
	}
}
