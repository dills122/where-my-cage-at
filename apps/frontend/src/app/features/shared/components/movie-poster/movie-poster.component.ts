import { Component, HostBinding, Input } from '@angular/core';

export type MoviePosterVariant = 'thumbnail' | 'detail';

@Component({
	selector: 'app-movie-poster',
	templateUrl: './movie-poster.component.html',
	styleUrls: ['./movie-poster.component.scss'],
	standalone: false
})
export class MoviePosterComponent {
	private path: string | null = null;

	@Input()
	set posterPath(value: string | null | undefined) {
		this.path = value?.trim() || null;
		this.hasError = false;
	}
	get posterPath(): string | null {
		return this.path;
	}

	@Input() title = '';
	@Input() variant: MoviePosterVariant = 'thumbnail';
	@Input() priority = false;
	@Input() decorative = true;
	@HostBinding('class.is-detail')
	get isDetail(): boolean {
		return this.variant === 'detail';
	}

	hasError = false;

	get intrinsicWidth(): number {
		return this.variant === 'detail' ? 342 : 92;
	}

	get intrinsicHeight(): number {
		return this.variant === 'detail' ? 513 : 138;
	}

	get altText(): string {
		return this.decorative ? '' : `${this.title} poster`;
	}

	handleError(): void {
		this.hasError = true;
	}
}
