import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThemeService } from '../services/theme/theme-service';

enum Themes {
  dark = 'dark-th',
  light = 'light-th'
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private theme: Themes;
  isDarkTheme: boolean = true;
  constructor(private themeService: ThemeService) {
    this.theme = Themes.dark;
  }

  handleChange(e: { checked: boolean }) {
    this.changeTheme(e.checked);
  }

  changeTheme(isDarkTheme: boolean) {
    this.theme = isDarkTheme ? Themes.dark : Themes.light;
    this.themeService.switchTheme(this.theme.toString());
  }
}
