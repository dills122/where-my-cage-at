import { Component, Input, OnInit } from '@angular/core';
import { MovieRecord } from 'src/app/models';
import { tmdbUrlBuilders } from '../../../../util';

@Component({
	selector: 'app-film-node',
	templateUrl: './film-node.component.html',
	styleUrls: ['./film-node.component.scss'],
	standalone: false
})
export class FilmNodeComponent implements OnInit {
	@Input()
	filmOverview!: MovieRecord;
	@Input()
	providerId!: number;
	tmdbUrl: string = '';
	constructor() {}
	ngOnInit(): void {
		this.tmdbUrl = tmdbUrlBuilders.buildMoviePageUrl(this.filmOverview.id);
	}
}
