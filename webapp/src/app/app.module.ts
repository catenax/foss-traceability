/*
 * Copyright 2021 The PartChain Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { keycloakInit } from './utils/keycloak-init';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AppRoutingModule } from './app.routing';
import { MyPartsModule } from './assets/modules/my-parts.module';
import { CoreModule } from './core/core.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AclModule } from './acl/acl.module';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { icons } from './shared/shared-icons.module';
import { PageNotFoundModule } from './page-not-found/page-not-found.module';
import { AboutModule } from './about/about.module';
import { IntroductionModule } from './introduction/introduction.module';
import { LayoutModule } from './layout/layout.module';
import { HttpErrorInterceptor } from './core/api/http-error.interceptor';
import { NotificationService } from './shared/components/notifications/notification.service';
import { AssetSearchModule } from './asset-search/asset-search.module';
import { ApiInterceptor } from './core/api/api.interceptor';
import { InvestigationsModule } from './investigations/investigations.module';
import { QualityAlertModule } from './quality-alert/quality-alert.module';
import { SupplierPartsModule } from './assets/modules/supplier-parts.module';
import { HeaderComponent } from './assets/presentation/assets-list/header/header.component';

/**
 *
 *
 * @export
 * @class AppModule
 */
@NgModule({
  declarations: [AppComponent, HeaderComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    KeycloakAngularModule,
    SvgIconsModule.forRoot({
      defaultSize: 'sm',
      sizes: {
        xs: '18px',
        sm: '24px',
        md: '36px',
        lg: '48px',
        xl: '64px',
        xxl: '128px',
      },
    }),
    SvgIconsModule.forChild(icons),
    LayoutModule,
    IntroductionModule,
    PageNotFoundModule,
    AboutModule,
    AclModule,
    QualityAlertModule,
    DashboardModule,
    MyPartsModule,
    SupplierPartsModule,
    AssetSearchModule,
    InvestigationsModule,
    CoreModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: keycloakInit,
      multi: true,
      deps: [KeycloakService],
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'en-GB',
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
      deps: [NotificationService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
