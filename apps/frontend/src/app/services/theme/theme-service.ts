import { DOCUMENT, Inject, Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ThemeService {
	constructor(@Inject(DOCUMENT) private document: Document) {}

	switchTheme(isDarkTheme: boolean) {
		this.document.documentElement.classList.toggle('app-dark', isDarkTheme);
	}
}
