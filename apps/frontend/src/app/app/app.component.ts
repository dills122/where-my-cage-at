import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThemeService } from '../services/theme/theme-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private theme: string;
  isDarkTheme: boolean;
  constructor(private themeService: ThemeService) {
    this.theme = 'dark-th';
    this.isDarkTheme = true;
  }

  changeTheme(theme: string) {
    this.theme = theme;
    this.themeService.switchTheme(this.theme);
  }
}
