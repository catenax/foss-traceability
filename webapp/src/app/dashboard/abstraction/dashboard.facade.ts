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

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../../core/user/user.service';
import { SharedService } from '../../shared/core/shared.service';
import { Dashboard, DashboardFilter, HistogramType, ReceivedAlertType } from '../model/dashboard.model';
import { DashboardService } from '../core/dashboard.service';
import { DashboardState } from '../core/dashboard.state';
import { AssetsPerPlant, MapChart } from '../model/assets-per-plant.model';
import { View } from 'src/app/shared/model/view.model';
import { delay } from 'rxjs/operators';
import { realm } from 'src/app/core/api/api.service.properties';
import { AssetFilter } from 'src/app/assets/model/asset-filter.model';
import { AssetsList } from 'src/app/assets/model/assets-list.model';
import { Moment } from 'moment';
import * as moment from 'moment/moment';
import { AffectedPart } from '../model/affected-parts.model';
import { DashTopAlerts, RemainingAlerts, TopAlerts } from '../model/top-alerts.model';
import { Investigation } from 'src/app/investigations/model/investigation.model';
import { flatten, map } from 'lodash-es';
import { QualityAlert } from 'src/app/quality-alert/model/quality-alert.model';

/**
 *
 *
 * @export
 * @class DashboardFacade
 */
@Injectable()
export class DashboardFacade {
  /**
   * @constructor DashboardFacade (DI)
   * @param {DashboardService} dashboardService
   * @param {SharedService} sharedService
   * @param {UserService} userService
   * @param {DashboardState} dashboardState
   * @memberof DashboardFacade
   */
  constructor(
    private dashboardService: DashboardService,
    private sharedService: SharedService,
    private userService: UserService,
    private dashboardState: DashboardState,
  ) {}

  /**
   * Get today's date
   *
   * @readonly
   * @type {string}
   * @memberof DashboardFacade
   */
  get today(): string {
    return this.sharedService.setTodayDate();
  }

  /**
   * Assets per country state getter
   *
   * @readonly
   * @type {Observable<View<MapChart[]>>}
   * @memberof DashboardFacade
   */
  get assetsPerCountry$(): Observable<View<MapChart>> {
    return this.dashboardState.getAssetsPerCountry$.pipe(delay(0));
  }

  /**
   * Get parts with active quality alerts
   *
   * @readonly
   * @type {Observable<View<number>>}
   * @memberof DashboardFacade
   */
  get partsWithQualityAlerts$(): Observable<View<number>> {
    return this.dashboardState.getPartsWithQualityAlerts$.pipe(delay(0));
  }

  /**
   * Get the total of available parts
   *
   * @readonly
   * @type {Observable<View<number>>}
   * @memberof DashboardFacade
   */
  get numberOfParts$(): Observable<View<number>> {
    return this.dashboardState.getNumberOfParts$.pipe(delay(0));
  }

  /**
   * Alert types state getter
   *
   * @readonly
   * @type {Observable<View<ReceivedAlertType[]>>}
   * @memberof DashboardFacade
   */
  get alertTypes$(): Observable<View<ReceivedAlertType[]>> {
    return this.dashboardState.getAlertTypes$.pipe(delay(0));
  }

  /**
   * Received alerts state
   *
   * @readonly
   * @type {Observable<View<GroupedAlert[]>>}
   * @memberof DashboardFacade
   */
  get alerts$(): Observable<View<DashTopAlerts>> {
    return this.dashboardState.getTopQualityAlerts$.pipe(delay(0));
  }

  /**
   * Received quality investigations state getter
   *
   * @readonly
   * @type {Observable<View<GroupedAlert[]>>}
   * @memberof DashboardFacade
   */
  get receivedQualityInvestigations$(): Observable<View<DashTopAlerts>> {
    return this.dashboardState.getTopQualityInvestigations$.pipe(delay(0));
  }

  /**
   * Parts with investigations state getter
   *
   * @readonly
   * @type {Observable<View<number>>}
   * @memberof DashboardFacade
   */
  get partsWithQualityInvestigations$(): Observable<View<number>> {
    return this.dashboardState.getPartsWithQualityInvestigations$.pipe(delay(0));
  }

  /**
   * Alerts by time state getter
   *
   * @readonly
   * @type {Observable<View<QualityAlertCountByTime[]>>}
   * @memberof DashboardFacade
   */
  get alertsByTime$(): Observable<View<{ data: HistogramType[]; groupedData: HistogramType[] }>> {
    return this.dashboardState.getAlertsByTime$.pipe(delay(0));
  }

  /**
   * Is first visit getter
   *
   * @readonly
   * @type {boolean}
   * @memberof DashboardFacade
   */
  get isFirstVisit(): boolean {
    if (this.userService.getFirstVisit() && !this.userService.getDashboardLoaded()) {
      this.userService.setDashboardLoaded();
      return true;
    }
    return false;
  }

  /**
   * Date picker properties getter
   *
   * @readonly
   * @type {{
   *     ranges: Record<string, Moment[]>;
   *     locale: { format: string; displayFormat: string; customRangeLabel: string };
   *   }}
   * @memberof DashboardFacade
   */
  get datePickerProps(): {
    ranges: Record<string, Moment[]>;
    locale: { format: string; displayFormat: string; customRangeLabel: string };
  } {
    return this.dashboardState.getDatePickerProps;
  }

  /**
   * Date grouping getter
   *
   * @readonly
   * @type {string[]}
   * @memberof DashboardFacade
   */
  get dateGrouping(): string[] {
    return this.dashboardState.getDateGrouping;
  }

  /**
   * Stats state setter
   *
   * @return {void}
   * @memberof DashboardFacade
   */
  public setNumberOfParts(): void {
    this.dashboardState.setNumberOfParts({ loader: true });
    this.dashboardService.getStats().subscribe(
      (kpiStats: Dashboard) => {
        const mspid = realm[1].toLocaleUpperCase();
        const assetsCount =
          kpiStats.qualityAlertCount[mspid] && kpiStats.qualityAlertCount[mspid].length
            ? +kpiStats.qualityAlertCount[mspid][0].totalAssetsCount
            : 0;

        this.dashboardState.setNumberOfParts({ data: assetsCount });
      },
      error => this.dashboardState.setNumberOfParts({ error }),
    );
  }

  /**
   * Assets per country state setter
   *
   * @param {DashboardFilter} filter
   * @return {void}
   * @memberof DashboardFacade
   */
  public setAssetsPerCountry(filter: DashboardFilter): void {
    this.dashboardState.setAssetsPerCountry({ loader: true });
    this.dashboardService.getAssetsPerCountry(filter).subscribe(
      (assetsPerCountry: AssetsPerPlant[]) => this.dashboardState.setAssetsPerCountry({ data: assetsPerCountry }),
      error => this.dashboardState.setAssetsPerCountry({ error }),
    );
  }

  /**
   * Received quality alerts state setter
   *
   * @return {void}
   * @memberof DashboardFacade
   */
  public setTopQualityAlerts(topAlerts: string): void {
    this.dashboardState.setTopQualityAlerts({ loader: true });
    this.dashboardService.getTopAlerts(topAlerts).subscribe(
      (qualityAlerts: { topAlerts: TopAlerts[]; remainingAlerts: RemainingAlerts }) =>
        this.dashboardState.setTopQualityAlerts({ data: qualityAlerts }),
      error => this.dashboardState.setTopQualityAlerts({ error }),
    );
  }

  /**
   * Received quality investigations state setter
   *
   * @return {void}
   * @memberof DashboardFacade
   */
  public setTopInvestigations(topAlerts: string): void {
    this.dashboardState.setTopQualityInvestigations({ loader: true });
    this.dashboardService.getTopInvestigations(topAlerts).subscribe(
      (investigations: { topAlerts: TopAlerts[]; remainingAlerts: RemainingAlerts }) =>
        this.dashboardState.setTopQualityInvestigations({ data: investigations }),
      error => this.dashboardState.setTopQualityInvestigations({ error }),
    );
  }

  /**
   * Parts with quality alerts setter
   *
   * @param {AssetFilter} filter
   * @param {string[]} fields
   * @return {void}
   * @memberof DashboardFacade
   */
  public setParts(filter: AssetFilter, fields: string[]): void {
    this.dashboardState.setPartsWithQualityAlerts({ loader: true });
    this.dashboardState.setAlertTypes({ loader: true });
    this.dashboardService.getAssets(filter, fields).subscribe(
      (assets: AssetsList) => {
        this.dashboardState.setPartsWithQualityAlerts({ data: assets.data });
        this.dashboardState.setAlertTypes({ data: assets });
      },
      error => {
        this.dashboardState.setPartsWithQualityAlerts({ error });
        this.dashboardState.setAlertTypes({ error });
      },
    );
  }

  /**
   * Set affected parts state
   *
   * @param {{ startDate: string; endDate: string }} filter
   * @return {void}
   * @memberof DashboardFacade
   */
  public setAffectedParts(filter: { startDate: Moment; endDate: Moment }): void {
    this.dashboardState.setAlertsByTime({ loader: true });
    const { startDate, endDate } = filter;
    this.dashboardService.getAffectedParts(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')).subscribe(
      (affectedParts: AffectedPart[]) => this.dashboardState.setAlertsByTime({ data: affectedParts }),
      error => this.dashboardState.setAlertsByTime({ error }),
    );
  }

  /**
   * Parts with quality investigations setter
   *
   * @return {{void}}
   * @memberof DashboardFacade
   */
  public setPartsWithQualityInvestigations(): void {
    this.dashboardState.setPartsWithQualityInvestigations({ loader: true });
    this.dashboardService.getPartsWithQualityInvestigations().subscribe(
      (investigations: Investigation[]) => {
        const partsAffected: QualityAlert[] = flatten(
          map(investigations, (investigation: Investigation) => investigation.partsAffected),
        );
        this.dashboardState.setPartsWithQualityInvestigations({ data: partsAffected.length });
      },
      error => this.dashboardState.setPartsWithQualityInvestigations({ error }),
    );
  }

  /**
   * Group histogram by the provided filter
   *
   * @param {string} groupValue
   * @return {void}
   * @memberof DashboardFacade
   */
  public groupHistogram(groupValue: string): void {
    this.dashboardState.setHistogramGrouping(groupValue);
  }

  /**
   * Date picker properties setter
   *
   * @return {void}
   * @memberof DashboardFacade
   */
  public setDatePickerProps(): void {
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
          .subtract(1, 'year')
          .endOf('year'),
      ],
    };
    const locale = {
      format: 'DD/MM/YYYY',
      displayFormat: 'DD/MM/YYYY',
      customRangeLabel: 'Custom date',
    };
    this.dashboardState.setDatePickerProps({ ranges, locale });
  }

  /**
   * Date grouping setter
   *
   * @return {void}
   * @memberof DashboardFacade
   */
  public setDateGrouping(): void {
    this.dashboardState.setGrouping(['Daily', 'Weekly', 'Monthly']);
  }
}
