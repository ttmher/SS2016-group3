import {App, Platform, MenuController, Nav} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {ViewChild} from '@angular/core';
import {HomePage} from './pages/home/home';
import {SettingPage} from './setting/setting';
import {Lists} from './Services/lists';

@App({
  templateUrl: 'build/app.html',
  providers: [Lists, SettingPage],
  config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})

export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;
  pages: Array<{ title: string, component: any, icon: string }>;

  constructor(private platform: Platform, private menu: MenuController) {
    this.initializeApp();
    this.pages = [
      { title: 'BusDriveApp', component: HomePage, icon: 'cube' },
      { title: 'Settings', component: SettingPage, icon: 'settings' }
    ];
  }

  /**
   * initializes the app
   */
  initializeApp() {
    this.platform.ready().then(() => {
      StatusBar.styleDefault();
    });
  }

  /**
   * closes the menu when clicking a link from the menu and navigates to the new page if it is not the current page
   */
  openPage(page) {
    this.menu.close();
    this.nav.setRoot(page.component);
  }
}