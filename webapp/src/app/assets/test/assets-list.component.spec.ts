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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { TemplateModule } from 'src/app/shared/template.module';
import { icons } from 'src/app/shared/shared-icons.module';
import { AssetsListFacade } from '../abstraction/assets-list.facade';
import { AssetsListComponent } from '../presentation/assets-list/assets-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { KeycloakService } from 'keycloak-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Realm } from 'src/app/core/model/realm.model';
import { View } from 'src/app/shared/model/view.model';
import { Asset } from 'src/app/shared/model/asset.model';
import { of } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AssetsList } from '../model/assets-list.model';
import { QualityAlertFacade } from 'src/app/quality-alert/abstraction/quality-alert.facade';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RoleDirective } from 'src/app/shared/directives/role.directive';

describe('AssetsListComponent', () => {
  let component: AssetsListComponent;
  let fixture: ComponentFixture<AssetsListComponent>;

  const userData = {
    getUserData() {
      return {
        username: 'Lion',
        firstname: 'Lion',
        surname: 'Lion',
        email: 'lion@email.com',
        mspid: 'Lion',
        realm_access: { roles: ['admin'] },
      };
    },
    getUrl() {
      return;
    },

    getMspid() {
      return;
    },
  };

  const mockFacade = {
    getDefaultForm() {
      const builder = new FormBuilder();
      return builder.group({
        serialNumberCustomer: [''],
        manufacturer: [''],
        productionCountryCode: [''],
        partNameNumber: [''],
        productionDateFrom: ['', Validators.required],
        productionDateTo: [''],
        qualityStatus: ['all'],
        manufacturerLine: [''],
        manufacturerPlant: [''],
        serialNumberType: ['SINGLE'],
      });
    },

    getOrgPreferences() {
      const mspId = 'Lion';
      const user: Realm = {} as Realm;
      if (mspId !== 'Lion' && mspId !== '92a2bd') {
        user.assetsTile = 'My components';
        user.componentsTile = 'Other parts';
      } else {
        user.assetsTile = 'My vehicles';
        user.componentsTile = 'Components';
      }
      return user;
    },

    getInitialFilter() {
      return {
        productionDateFrom: { value: '01-01-2021' },
        productionDateTo: { value: '01-04-2021' },
      };
    },

    getFilter() {
      return { type: { value: 'own' } };
    },

    get assets$() {
      const asset: Asset = {
        manufacturer: 'BMW',
        partNameManufacturer: 'BMW 7er LG Limousine Langversion',
        partNumberCustomer: '',
        partNumberManufacturer: 'G12',
        productionCountryCodeManufacturer: 'DE',
        productionDateGmt: '2021-03-17T13:07:52.000Z',
        qualityStatus: 'OK',
        serialNumberCustomer: 'A1616054277.872456615561',
        serialNumberManufacturer: 'A1616054277.872455115561',
        status: 'PRODUCED',
        childComponents: [],
        mspid: 'Lion',
        serialNumberType: 'SINGLE',
      };
      const view: View<AssetsList> = {
        data: { resultLength: 1, data: [asset], nextPage: true },
      };
      return of(view);
    },

    setFilters() {
      return true;
    },

    setAssets() {
      return true;
    },

    resetAssets() {
      return true;
    },

    resetSelectedRows() {
      return true;
    },

    resetFilters() {
      return true;
    },

    setSelectedAsset() {
      return;
    },
  };

  const mockQualityAlert = {
    createQualityAlert() {
      return;
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        HttpClientTestingModule,
        TemplateModule,
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
      ],
      declarations: [AssetsListComponent, RoleDirective],
      providers: [
        KeycloakService,
        { provide: AuthService, useValue: userData },
        { provide: Router, useValue: { url: '/vehicles' } },
        { provide: AssetsListFacade, useValue: mockFacade },
        { provide: QualityAlertFacade, useValue: mockQualityAlert },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { id: '24fkzrw3487943uf358lovd' } },
          },
        },
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsListComponent);
    component = fixture.componentInstance;
    component.queryType = 'own';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
