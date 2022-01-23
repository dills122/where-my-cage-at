import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ServiceProviderRepository } from '../repositories';
import { ServiceProvidersService } from '../services/service-providers/service-providers.service';
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
export default class AppComponent implements OnInit, OnDestroy {
  private theme: Themes;
  isDarkTheme: boolean = true;
  subscriptions: Subscription[] = [];
  constructor(private themeService: ThemeService, private serviceProviderService: ServiceProvidersService) {
    this.theme = Themes.dark;
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  ngOnInit(): void {
    this.subscriptions = [this.serviceProviderService.getServiceProviders().subscribe()];
  }

  handleChange(e: { checked: boolean }) {
    this.changeTheme(e.checked);
  }

  changeTheme(isDarkTheme: boolean) {
    this.theme = isDarkTheme ? Themes.dark : Themes.light;
    this.themeService.switchTheme(this.theme.toString());
  }
}
