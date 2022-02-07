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

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardFacade } from '../abstraction/dashboard.facade';
import { MapChart } from '../model/assets-per-plant.model';
import { View } from 'src/app/shared/model/view.model';
import { Router } from '@angular/router';
import { realm } from 'src/app/core/api/api.service.properties';
import { LayoutFacade } from 'src/app/shared/abstraction/layout-facade';
import { AssetFilter } from 'src/app/assets/model/asset-filter.model';
import { fields } from 'src/app/assets/model/assets-list.model';
import { HistogramType, ReceivedAlertType } from '../model/dashboard.model';
import { Moment } from 'moment';
import * as moment from 'moment';
import { DashTopAlerts } from '../model/top-alerts.model';

/**
 *
 *
 * @export
 * @class DashboardComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit {
  /**
   * Dashboard title
   *
   * @type {string}
   * @memberof DashboardComponent
   */
  public title = 'Dashboard';

  /**
   * Show introduction wizard for new users
   *
   * @type {boolean}
   * @memberof DashboardComponent
   */
  public showIntroduction = false;

  /**
   * Assets per country state
   *
   * @type {Observable<View<MapChart[]>>}
   * @memberof DashboardComponent
   */
  public assetsPerCountry$: Observable<View<MapChart>>;

  /**
   * Parts with quality alerts state
   *
   * @type {Observable<View<number>>}
   * @memberof DashboardComponent
   */
  public partsWithQualityAlerts$: Observable<View<number>>;

  /**
   * Total of parts state
   *
   * @type {Observable<View<number>>}
   * @memberof DashboardComponent
   */
  public numberOfParts$: Observable<View<number>>;

  /**
   * Alert types state observable
   *
   * @type {Observable<View<ReceivedAlertType[]>>}
   * @memberof DashboardComponent
   */
  public alertTypes$: Observable<View<ReceivedAlertType[]>>;

  /**
   * Received alerts
   *
   * @type {Observable<View<GroupedAlert[]>>}
   * @memberof DashboardComponent
   */
  public topQualityAlerts$: Observable<View<DashTopAlerts>>;

  /**
   * Received quality investigations state
   *
   * @type {Observable<View<GroupedAlert[]>>}
   * @memberof DashboardComponent
   */
  public topQualityInvestigations$: Observable<View<DashTopAlerts>>;

  /**
   * Parts with quality alerts state
   *
   * @type {Observable<View<number>>}
   * @memberof DashboardComponent
   */
  public partsWithQualityInvestigations$: Observable<View<number>>;

  /**
   * Quality alerts by time
   *
   * @type {Observable<QualityAlertCountByTime[]>}
   * @memberof DashboardComponent
   */
  public alertsByTime$: Observable<View<{ data: HistogramType[]; groupedData: HistogramType[] }>>;

  /**
   * Is grouping filter expanded
   *
   * @type {boolean}
   * @memberof DashboardComponent
   */
  public isExpanded: boolean;

  /**
   * Date grouping values
   *
   * @type {string[]}
   * @memberof DashboardComponent
   */
  public dateGrouping: string[];

  /**
   * Grouping filter selected value
   *
   * @type {string}
   * @memberof DashboardComponent
   */
  public selectedValue: string;

  /**
   * Date picker range
   *
   * @type {{ startDate: Moment; endDate: Moment }}
   * @memberof DashboardComponent
   */
  public selected: { startDate: Moment; endDate: Moment };

  /**
   * Date picker type of ranges
   *
   * @type {Record<string, Moment[]>}
   * @memberof DashboardComponent
   */
  public ranges: Record<string, Moment[]>;

  /**
   * Date picker locale properties
   *
   * @type {{
   *     format: string;
   *     displayFormat: string;
   *     customRangeLabel: string;
   *   }}
   * @memberof DashboardComponent
   */
  public locale: {
    format: string;
    displayFormat: string;
    customRangeLabel: string;
  };

  /**
   * @constructor DashboardComponent
   * @param {DashboardFacade} dashboardFacade
   * @param {Router} router
   * @param {LayoutFacade} layoutFacade
   * @memberof DashboardComponent
   */
  constructor(private dashboardFacade: DashboardFacade, private router: Router, private layoutFacade: LayoutFacade) {
    this.showIntroduction = this.dashboardFacade.isFirstVisit;
    this.dashboardFacade.setDatePickerProps();
    this.dashboardFacade.setDateGrouping();
    this.topQualityAlerts$ = this.dashboardFacade.alerts$;
    this.topQualityInvestigations$ = this.dashboardFacade.receivedQualityInvestigations$;
    this.assetsPerCountry$ = this.dashboardFacade.assetsPerCountry$;
    this.partsWithQualityAlerts$ = this.dashboardFacade.partsWithQualityAlerts$;
    this.numberOfParts$ = this.dashboardFacade.numberOfParts$;
    this.alertTypes$ = this.dashboardFacade.alertTypes$;
    this.partsWithQualityInvestigations$ = this.dashboardFacade.partsWithQualityInvestigations$;
    this.alertsByTime$ = this.dashboardFacade.alertsByTime$;
    this.isExpanded = false;
    this.selected = {
      startDate: moment()
        .subtract(6, 'month')
        .startOf('month'),
      endDate: moment()
        .subtract(1, 'month')
        .endOf('month'),
    };
  }

  /**
   * Angular lifecycle method - On Init
   *
   * @return {void}
   * @memberof DashboardComponent
   */
  ngOnInit(): void {
    const filter: AssetFilter = {
      type: { value: 'own' },
      productionDateFrom: { value: '2019-01-01' },
      productionDateTo: {
        value: this.dashboardFacade.today,
      },
    };

    const { productionDateFrom, productionDateTo } = filter;
    const { ranges, locale } = this.dashboardFacade.datePickerProps;
    this.ranges = ranges;
    this.locale = locale;
    this.dateGrouping = this.dashboardFacade.dateGrouping;
    this.selectedValue = this.dateGrouping[0];
    this.dashboardFacade.setTopQualityAlerts('5');
    this.dashboardFacade.setNumberOfParts();
    this.dashboardFacade.setAssetsPerCountry({ productionDateFrom, productionDateTo });
    this.dashboardFacade.setParts(filter, fields);
    this.dashboardFacade.setAffectedParts(this.selected);
    this.dashboardFacade.setTopInvestigations('5');
    this.dashboardFacade.setPartsWithQualityInvestigations();
  }

  /**
   * Histogram set dates event
   *
   * @param {{ startDate: Moment; endDate: Moment }} filter
   * @return {void}
   * @memberof DashboardComponent
   */
  public setDates(filter: { startDate: Moment; endDate: Moment }): void {
    this.dashboardFacade.setAffectedParts(filter);
  }

  /**
   * Quality investigations route
   *
   * @return {void}
   * @memberof DashboardComponent
   */
  public navigateToInvestigations(): void {
    this.layoutFacade.setTabIndex(0);
    this.router.navigate([`${realm[1]}/investigations`]).then();
  }

  /**
   * Quality alert route
   *
   * @return {void}
   * @memberof DashboardComponent
   */
  public navigateToAlerts(): void {
    this.layoutFacade.setTabIndex(0);
    this.router.navigate([`${realm[1]}/quality-alert`]).then();
  }

  /**
   * My parts route
   *
   * @return {void}
   * @memberof DashboardComponent
   */
  public navigateToParts(): void {
    this.router.navigate([`${realm[1]}/my-parts/`]).then();
  }

  /**
   * View alerts or investigations details route
   *
   * @param {string} view
   * @return {void}
   * @memberof DashboardComponent
   */
  public viewDetails(view: string): void {
    this.router.navigate([`${realm[1]}/${view}`]).then();
  }

  /**
   * Expand icon
   *
   * @return {string}
   * @memberof DashboardComponent
   */
  public getIcon(): string {
    return this.isExpanded ? 'arrow-up-s-line' : 'arrow-down-s-line';
  }

  /**
   * Grouping filter selected value
   *
   * @param {string} selectedValue
   * @return {void}
   * @memberof DashboardComponent
   */
  public getSelectedValue(selectedValue: string): void {
    this.selectedValue = selectedValue;
    this.dashboardFacade.groupHistogram(this.selectedValue);
    this.isExpanded = false;
  }
}
