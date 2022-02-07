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
import { State } from '../../shared/model/state';
import { DashboardAssembler } from './dashboard.assembler';
import { AssetsPerPlant, MapChart } from '../model/assets-per-plant.model';
import { View } from 'src/app/shared/model/view.model';
import { AssetsList } from 'src/app/assets/model/assets-list.model';
import { HistogramType, ReceivedAlertType } from '../model/dashboard.model';
import { Asset } from 'src/app/shared/model/asset.model';
import { Moment } from 'moment';
import { AffectedPart } from '../model/affected-parts.model';
import { DashTopAlerts, RemainingAlerts, TopAlerts } from '../model/top-alerts.model';

/**
 *
 *
 * @export
 * @class DashboardState
 */
@Injectable()
export class DashboardState {
  /**
   * Assets per country state
   *
   * @private
   * @readonly
   * @type {State<View<MapChart[]>>}
   * @memberof DashboardState
   */
  private readonly assetsPerCountry$: State<View<MapChart>> = new State<View<MapChart>>({ loader: true });

  /**
   * Parts with quality alerts state
   *
   * @private
   * @type {State<View<number>>}
   * @memberof DashboardState
   */
  private readonly partsWitQualityAlerts$: State<View<number>> = new State<View<number>>({ loader: true });

  /**
   * Total of parts request
   *
   * @private
   * @type {State<View<number>>}
   * @memberof DashboardState
   */
  private readonly numberOfParts$: State<View<number>> = new State<View<number>>({ loader: true });

  /**
   * Alert type state
   *
   * @private
   * @type {State<View<ReceivedAlertType[]>>}
   * @memberof DashboardState
   */
  private readonly alertTypes$: State<View<ReceivedAlertType[]>> = new State<View<ReceivedAlertType[]>>({
    loader: true,
  });

  /**
   * Received quality alerts state
   *
   * @private
   * @type {State<View<GroupedAlert[]>>}
   * @memberof DashboardState
   */
  private readonly topQualityAlerts$: State<View<DashTopAlerts>> = new State<View<DashTopAlerts>>({
    loader: true,
  });

  /**
   * Received quality investigations state
   *
   * @private
   * @type {State<View<GroupedAlert[]>>}
   * @memberof DashboardState
   */
  private readonly topQualityInvestigations$: State<View<DashTopAlerts>> = new State<View<DashTopAlerts>>({
    loader: true,
  });

  /**
   * Parts with quality investigations
   *
   * @private
   * @type {State<View<number>>}
   * @memberof DashboardState
   */
  private readonly partsWithQualityInvestigations$: State<View<number>> = new State<View<number>>({ loader: true });

  /**
   * Number of alerts by time state
   *
   * @private
   * @type {State<View<QualityAlertCountByTime[]>>}
   * @memberof DashboardState
   */
  private readonly alertsByTime$: State<View<{ data: HistogramType[]; groupedData: HistogramType[] }>> = new State<
    View<{ data: HistogramType[]; groupedData: HistogramType[] }>
  >({
    loader: true,
  });

  /**
   * Date picker properties
   *
   * @private
   * @type {{
   *     ranges: Record<string, Moment[]>;
   *     locale: { format: string; displayFormat: string; customRangeLabel: string };
   *   }}
   * @memberof DashboardState
   */
  private datePickerProps: {
    ranges: Record<string, Moment[]>;
    locale: { format: string; displayFormat: string; customRangeLabel: string };
  };

  /**
   * Date grouping values
   *
   * @private
   * @type {string[]}
   * @memberof DashboardState
   */
  private dateGrouping: string[];

  /**
   * Assets per country getter
   *
   * @readonly
   * @type {Observable<View<MapChart[]>>}
   * @memberof DashboardState
   */
  get getAssetsPerCountry$(): Observable<View<MapChart>> {
    return this.assetsPerCountry$.observable;
  }

  /**
   * Parts with quality alerts getter
   *
   * @readonly
   * @type {Observable<View<number>>}
   * @memberof DashboardState
   */
  get getPartsWithQualityAlerts$(): Observable<View<number>> {
    return this.partsWitQualityAlerts$.observable;
  }

  /**
   * Total of parts state
   *
   * @readonly
   * @type {Observable<View<number>>}
   * @memberof DashboardState
   */
  get getNumberOfParts$(): Observable<View<number>> {
    return this.numberOfParts$.observable;
  }

  /**
   * Alert types state getter
   *
   * @readonly
   * @type {Observable<View<ReceivedAlertType[]>>}
   * @memberof DashboardState
   */
  get getAlertTypes$(): Observable<View<ReceivedAlertType[]>> {
    return this.alertTypes$.observable;
  }

  /**
   * Received quality alert state getter
   *
   * @readonly
   * @type {Observable<View<GroupedAlert[]>>}
   * @memberof DashboardState
   */
  get getTopQualityAlerts$(): Observable<View<DashTopAlerts>> {
    return this.topQualityAlerts$.observable;
  }

  /**
   * Received quality investigations state getter
   *
   * @readonly
   * @type {Observable<View<GroupedAlert[]>>}
   * @memberof DashboardState
   */
  get getTopQualityInvestigations$(): Observable<View<DashTopAlerts>> {
    return this.topQualityInvestigations$.observable;
  }

  /**
   * Parts with quality investigations state getter
   *
   * @readonly
   * @type {Observable<View<number>>}
   * @memberof DashboardState
   */
  get getPartsWithQualityInvestigations$(): Observable<View<number>> {
    return this.partsWithQualityInvestigations$.observable;
  }

  /**
   * Alerts by time state getter
   *
   * @readonly
   * @type {Observable<View<QualityAlertCountByTime[]>>}
   * @memberof DashboardState
   */
  get getAlertsByTime$(): Observable<View<{ data: HistogramType[]; groupedData: HistogramType[] }>> {
    return this.alertsByTime$.observable;
  }

  /**
   * Date picker property getter
   *
   * @readonly
   * @type {{
   *     ranges: Record<string, Moment[]>;
   *     locale: { format: string; displayFormat: string; customRangeLabel: string };
   *   }}
   * @memberof DashboardState
   */
  get getDatePickerProps(): {
    ranges: Record<string, Moment[]>;
    locale: { format: string; displayFormat: string; customRangeLabel: string };
  } {
    return this.datePickerProps;
  }

  /**
   * Date grouping getter
   *
   * @readonly
   * @type {string[]}
   * @memberof DashboardState
   */
  get getDateGrouping(): string[] {
    return this.dateGrouping;
  }

  /**
   * Assets per country setter
   *
   * @param {View<AssetsPerPlant[]>} assetsPerCountry
   * @return {void}
   * @memberof DashboardState
   */
  public setAssetsPerCountry(assetsPerCountry: View<AssetsPerPlant[]>): void {
    const mapView: View<MapChart> = {
      data: assetsPerCountry.data && DashboardAssembler.assembleMap(assetsPerCountry.data),
      loader: assetsPerCountry.loader,
      error: assetsPerCountry.error,
    };
    this.assetsPerCountry$.update(mapView);
  }

  /**
   * Received quality alert state setter
   *
   * @param {View<Investigation[]>} qualityAlerts
   * @return {void}
   * @memberof DashboardState
   */
  public setTopQualityAlerts(qualityAlerts: View<{ topAlerts: TopAlerts[]; remainingAlerts: RemainingAlerts }>): void {
    const dashboardAlerts: View<DashTopAlerts> = {
      data: qualityAlerts.data && DashboardAssembler.assembleDashboardAlert(qualityAlerts.data),
      loader: qualityAlerts.loader,
      error: qualityAlerts.error,
    };

    this.topQualityAlerts$.update(dashboardAlerts);
  }

  /**
   * Received quality investigations state setter
   *
   * @param {View<Investigation[]>} qualityInvestigations
   * @memberof DashboardState
   */
  public setTopQualityInvestigations(
    qualityInvestigations: View<{ topAlerts: TopAlerts[]; remainingAlerts: RemainingAlerts }>,
  ): void {
    const groupedInvestigations: View<DashTopAlerts> = {
      data: qualityInvestigations.data && DashboardAssembler.assembleDashboardAlert(qualityInvestigations.data),
      loader: qualityInvestigations.loader,
      error: qualityInvestigations.error,
    };
    this.topQualityInvestigations$.update(groupedInvestigations);
  }

  /**
   * Parts with quality alerts setter
   *
   * @param {View<AssetsList>} assets
   * @return {void}
   * @memberof DashboardState
   */
  public setPartsWithQualityAlerts(assets: View<Asset[]>): void {
    // TODO: JOIN THIS SETTER WITH ALERT TYPE SETTER. ASSEMBLER CALLED 2 TIMES
    const partsWithQualityAlertsView: View<number> = {
      data:
        assets.data &&
        DashboardAssembler.assembledAlertTypes(assets.data)
          .map(alert => alert.total)
          .reduce((acc, curr) => acc + curr, 0),
      loader: assets.loader,
      error: assets.error,
    };
    this.partsWitQualityAlerts$.update(partsWithQualityAlertsView);
  }

  /**
   * Total of parts setter
   *
   * @param {View<AssetsList>} assets
   * @return {void}
   * @memberof DashboardState
   */
  public setNumberOfParts(assets: View<number>): void {
    this.numberOfParts$.update(assets);
  }

  /**
   * Parts with quality alerts state setter
   *
   * @param {View<number>} parts
   * @return {void}
   * @memberof DashboardState
   */
  public setPartsWithQualityInvestigations(parts: View<number>): void {
    this.partsWithQualityInvestigations$.update(parts);
  }

  /**
   * Alerts by time state setter
   *
   * @param {View<AffectedPart[]>} affectedParts
   * @memberof DashboardState
   */
  public setAlertsByTime(affectedParts: View<AffectedPart[]>): void {
    const histogramData = affectedParts.data && DashboardAssembler.assembleHistogram(affectedParts.data);
    const histogramView: View<{ data: HistogramType[]; groupedData: HistogramType[] }> = {
      data: {
        data: histogramData,
        groupedData: histogramData,
      },
      loader: affectedParts.loader,
      error: affectedParts.error,
    };

    this.alertsByTime$.update(histogramView);
  }

  /**
   * Alert types state setter
   *
   * @param {View<AssetsList>} assets
   * @return {void}
   * @memberof DashboardState
   */
  public setAlertTypes(assets: View<AssetsList>): void {
    const alertTypes: View<ReceivedAlertType[]> = {
      data: assets.data && DashboardAssembler.assembledAlertTypes(assets.data.data),
      loader: assets.loader,
      error: assets.error,
    };

    this.alertTypes$.update(alertTypes);
  }

  /**
   * Date picker properties setter
   *
   * @param {{
   *     ranges: Record<string, Moment[]>;
   *     locale: { format: string; displayFormat: string; customRangeLabel: string };
   *   }} datePickerProps
   * @memberof DashboardState
   */
  public setDatePickerProps(datePickerProps: {
    ranges: Record<string, Moment[]>;
    locale: { format: string; displayFormat: string; customRangeLabel: string };
  }): void {
    this.datePickerProps = datePickerProps;
  }

  /**
   * Histogram grouping by filter
   *
   * @param {string} groupingValue
   * @return {void}
   * @memberof DashboardState
   */
  public setHistogramGrouping(groupingValue: string): void {
    this.alertsByTime$.update({
      data: DashboardAssembler.groupHistogramData(this.alertsByTime$.snapshot.data, groupingValue),
    });
  }

  /**
   * Date grouping setter
   *
   * @param {string[]} groupingValues
   * @return {void}
   * @memberof DashboardState
   */
  public setGrouping(groupingValues: string[]): void {
    this.dateGrouping = groupingValues;
  }
}
