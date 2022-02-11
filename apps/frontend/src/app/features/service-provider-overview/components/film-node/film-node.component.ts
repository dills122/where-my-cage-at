import { Component, Input, OnInit } from '@angular/core';
import { MovieRecord } from 'src/app/models';
import { tmdbUrlBuilders } from '../../../../util';

@Component({
	selector: 'app-film-node',
	templateUrl: './film-node.component.html',
	styleUrls: ['./film-node.component.scss']
})
export class FilmNodeComponent implements OnInit {
	@Input()
	filmOverview!: MovieRecord;
	tmdbUrl: string = '';
	constructor() {}
	ngOnInit(): void {
		this.tmdbUrl = tmdbUrlBuilders.buildMoviePageUrl(this.filmOverview.id);
	}
	openTmdb() {
		window.open(this.tmdbUrl, '_blank');
	}
}
