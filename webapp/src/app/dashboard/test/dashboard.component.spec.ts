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

import { HttpClient, HttpHandler } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import * as moment from 'moment';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { AuthService } from 'src/app/core/auth/auth.service';
import { DashboardFacade } from '../abstraction/dashboard.facade';
import { DashboardComponent } from '../presentation/dashboard.component';
import { MapComponent } from '../presentation/map/map.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
  };

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
  const mockedFacade = {
    get datePickerProps(): {
      ranges: Record<string, moment.Moment[]>;
      locale: { format: string; displayFormat: string; customRangeLabel: string };
    } {
      const ranges = {
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'Last 6 Months': [
          moment()
            .subtract(6, 'month')
            .startOf('month'),
          moment()
            .subtract(1, 'month')
            .endOf('month'),
        ],
        'Last year': [
          moment()
            .subtract(1, 'year')
            .startOf('year'),
          moment()
            .subtract(12, 'month')
            .endOf('month'),
        ],
      };
      const locale = {
        format: 'DD/MM/YYYY',
        displayFormat: 'DD/MM/YYYY',
        customRangeLabel: 'Custom date',
      };
      return { ranges, locale };
    },

    get isFirstVisit() {
      return false;
    },

    get initialFilter() {
      return {
        productionDateFrom: { value: '14-04-2020' },
        productionDateTo: { value: '20-06-2020' },
      };
    },

    get dateGrouping(): string[] {
      return ['Daily', 'Weekly', 'Monthly'];
    },

    setNumberOfParts() {
      return true;
    },

    setAssetsPerCountry() {
      return true;
    },

    setReceivedQualityAlerts() {
      return true;
    },

    setParts() {
      return true;
    },

    setTopQualityAlerts() {
      return true;
    },

    setTopInvestigations() {
      return true;
    },

    setDatePickerProps() {
      return;
    },

    setAffectedParts() {
      return;
    },

    setDateGrouping() {
      return;
    },

    setPartsWithQualityInvestigations() {
      return;
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NgxDaterangepickerMd.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [DashboardComponent, MapComponent],
      providers: [
        KeycloakService,
        HttpClient,
        HttpHandler,
        { provide: DashboardFacade, useValue: mockedFacade },
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: userData },
      ],
    });
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    component.showIntroduction = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
