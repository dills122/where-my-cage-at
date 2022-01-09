import { Injectable } from '@angular/core';
import { NbThemeService } from '@nebular/theme';

export type Theme = 'purple-theme' | 'custom-dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme: Theme = 'custom-dark';

  constructor(private themeService: NbThemeService) {}

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'purple-theme' ? 'custom-dark' : 'purple-theme';
    this.themeService.changeTheme(this.currentTheme);
  }
}
