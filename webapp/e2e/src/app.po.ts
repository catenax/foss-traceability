import { browser } from 'protractor';

export class AppPage {
  navigateTo(url: string): unknown {
    return browser.get(url);
  }
}
