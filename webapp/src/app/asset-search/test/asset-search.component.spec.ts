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

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AssetFacade } from 'src/app/shared/abstraction/asset-facade';
import { Asset } from 'src/app/shared/model/asset.model';

import { AssetSearchComponent } from '../presentation/asset-search.component';

describe('AssetSearchComponent', () => {
  let component: AssetSearchComponent;
  let fixture: ComponentFixture<AssetSearchComponent>;
  const assetFacadeStub = {
    get() {
      const asset: Asset = {
        manufacturer: '',
        productionCountryCodeManufacturer: '',
        partNameManufacturer: '',
        partNumberManufacturer: '',
        partNumberCustomer: '',
        serialNumberManufacturer: '',
        serialNumberCustomer: '',
        qualityStatus: '',
        status: '',
        productionDateGmt: '',
        childComponents: [],
        componentsSerialNumbers: [],
        icon: '',
        parents: [],
        mspid: '',
        manufacturerLine: '',
        manufacturerPlant: '',
        serialNumberType: '',
        parentSerialNumberManufacturer: '',
        customFields: {
          field: '',
          value: '',
        },
      };
      return of(asset);
    },

    setOrganizations() {
      return;
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AssetSearchComponent],
      providers: [{ provide: AssetFacade, useValue: assetFacadeStub }],
    });
    fixture = TestBed.createComponent(AssetSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
