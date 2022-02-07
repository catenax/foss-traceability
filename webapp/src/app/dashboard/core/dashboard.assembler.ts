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

import {
  groupBy,
  values,
  keys,
  assign,
  entries,
  sortBy,
  orderBy,
  pick,
  xor,
  intersection,
  has,
  sum,
  reduce,
  flatten,
} from 'lodash-es';
import { realm } from 'src/app/core/api/api.service.properties';
import { AssetsPerPlant, MapChart, PartsCoordinates } from '../model/assets-per-plant.model';
import { byIso } from 'country-code-lookup';
import { Asset } from 'src/app/shared/model/asset.model';
import { HistogramType, ReceivedAlertType } from '../model/dashboard.model';
import { QualityAlertIcons, QualityTypes } from 'src/app/quality-alert/model/quality-alert.model';
import { DateTime } from 'luxon';
import { Dictionary } from 'lodash';
import { AffectedPart } from '../model/affected-parts.model';
import { DashTopAlerts, GroupedTopAlerts, RemainingAlerts, TopAlerts } from '../model/top-alerts.model';

/**
 *
 *
 * @export
 * @class DashboardAssembler
 */
export class DashboardAssembler {
  /**
   * Helper method to join countries that shared the same coordinates
   *
   * @static
   * @param {AssetsPerPlant[]} assetsPerPlant
   * @return {MapChart[]}
   * @memberof DashboardAssembler
   */
  public static assembleMap(assetsPerPlant: AssetsPerPlant[]): MapChart {
    // TODO: Back-end -> Remove date filter from map

    const mspid = realm[1].toLocaleUpperCase();
    const groupedByCoordinates: Record<string, AssetsPerPlant[]> = groupBy(assetsPerPlant, 'coordinates');

    const partsPerCountry: number[] = values(groupedByCoordinates).map((plant: AssetsPerPlant[]) =>
      plant.map(assets => assets.assetsCount).reduce((acc, curr) => acc + curr, 0),
    );

    const locationCoordinates = keys(groupedByCoordinates).reduce(
      (acc, currentCoordinates, index) => ({ ...acc, [currentCoordinates]: partsPerCountry[index] }),
      [],
    );

    const coordinates: PartsCoordinates[] = entries(locationCoordinates).map(([partsCoordinates, numberOfParts]) => {
      return {
        coordinates: partsCoordinates.split(','),
        numberOfParts,
      };
    });

    assetsPerPlant.forEach(value => (value.country = byIso(value.countryCode).country));

    const assetsOrderByParts: AssetsPerPlant[] = orderBy(assetsPerPlant, ['assetsCount'], ['desc']);

    const assetsSortedByLoggedRealm: AssetsPerPlant[] = sortBy(
      assetsOrderByParts,
      assets => assets.manufacturer !== mspid && !assets.manufacturer.includes(mspid),
    );

    return { assetsPerPlant: assetsSortedByLoggedRealm, coordinates };
  }

  /**
   * Grouping alerts by type
   *
   * @static
   * @param {Asset[]} assets
   * @return {ReceivedAlertType[]}
   * @memberof DashboardAssembler
   */
  public static assembledAlertTypes(assets: Asset[]): ReceivedAlertType[] {
    // TODO: Back-end -> Change back-end query to avoid front-end logic
    const assetsWithQualityIssues: Asset[] = assets.filter(asset => asset.qualityStatus === 'NOK');

    const groupedAlerts = groupBy(assetsWithQualityIssues, 'customFields.qualitytype');

    const mappedTypes = pick(groupedAlerts, keys(QualityTypes));

    const reducedTypes = keys(mappedTypes).reduce(
      (acc, currentAssets, index) => ({
        ...acc,
        [currentAssets]: values(mappedTypes)[index].length,
      }),
      [],
    );
    return entries(reducedTypes).map(([type, total]) => {
      return {
        type,
        total,
        color: QualityTypes[type],
      };
    });
  }

  /**
   * Dashboard alert assembler
   *
   * @static
   * @param {GroupedAlert[]} alerts
   * @return {DashTopAlerts}
   * @memberof DashboardAssembler
   */
  public static assembleDashboardAlert(alerts: {
    topAlerts: TopAlerts[];
    remainingAlerts: RemainingAlerts;
  }): DashTopAlerts {
    const receivedTopAlerts: Dictionary<[TopAlerts, ...TopAlerts[]]> = groupBy(alerts.topAlerts, 'alertId');
    const mappedTopAlerts: Record<string, GroupedTopAlerts> = {};
    for (const group in receivedTopAlerts) {
      mappedTopAlerts[group] = reduce(
        receivedTopAlerts[group],
        (_: GroupedTopAlerts, value: TopAlerts) => {
          return {
            alertId: value.alertId,
            icon: QualityAlertIcons[value.qualityType],
            qualityType: value.qualityType,
            date: value.updated.split('T')[0],
            originCompany: value.eventOriginCompany,
            numberOfParts: receivedTopAlerts[group].length,
            originPartnerName: value.originPartnerName,
          };
        },
        {} as GroupedTopAlerts,
      );
    }

    const orderedRemainingAlerts: RemainingAlerts = {} as RemainingAlerts;
    keys(alerts.remainingAlerts)
      .sort((a, b) => keys(QualityTypes).indexOf(b) - keys(QualityTypes).indexOf(a))
      .forEach(key => (orderedRemainingAlerts[key] = alerts.remainingAlerts[key]));

    return {
      topAlerts: flatten(values(mappedTopAlerts)),
      remainingAlerts: orderedRemainingAlerts,
    };
  }

  /**
   * Histogram assembler
   *
   * @static
   * @param {AffectedPart[]} affectedParts
   * @return {HistogramType[]}
   * @memberof DashboardAssembler
   */
  public static assembleHistogram(affectedParts: AffectedPart[]): HistogramType[] {
    const groupByDate = groupBy(affectedParts, 'date');

    const histogramRecords: Record<string, HistogramType> = {};

    for (const data in groupByDate) {
      histogramRecords[data] = assign(
        {},
        ...groupByDate[data].reduce(
          (acc: HistogramType[], item: AffectedPart) => [...acc, DashboardAssembler.buildHistogramObject(item)],
          [],
        ),
      );
    }

    const totals: Array<{ total: number }> = values(histogramRecords)
      .map(value => pick(value, keys(QualityTypes)))
      .reduce((acc: Array<{ total: number }>, item: Partial<HistogramType>) => {
        return [...acc, { total: sum(values(item)) }];
      }, []);

    values(histogramRecords).forEach((record, index) => {
      const types = keys(QualityTypes);
      const symmetricDifference = xor(types, keys(record));
      const intersectionOfArrays = intersection(symmetricDifference, types);
      for (const type in intersectionOfArrays) {
        record[intersectionOfArrays[type]] = 0;
        record.total = totals[index].total;
      }
    });

    return values(histogramRecords);
  }

  /**
   * Grouping histogram by provided filter
   *
   * @static
   * @param {{
   *       data: HistogramType[];
   *       groupedData: HistogramType[];
   *     }} histogramData
   * @param {string} selectedGrouping
   * @return {{ data: HistogramType[]; groupedData: HistogramType[] }}
   * @memberof DashboardAssembler
   */
  public static groupHistogramData(
    histogramData: {
      data: HistogramType[];
      groupedData: HistogramType[];
    },
    selectedGrouping: string,
  ): { data: HistogramType[]; groupedData: HistogramType[] } {
    const filter = {
      Daily: 'date',
      Weekly: 'week',
      Monthly: 'month',
    };

    if (selectedGrouping === 'Daily') {
      return {
        data: histogramData.data,
        groupedData: histogramData.data,
      };
    } else {
      const groupedHistogramData = groupBy(histogramData.data, (value: HistogramType) => {
        const digits: number = (Math.log(value[filter[selectedGrouping]]) * Math.LOG10E + 1) | 0;

        const numberForSelectedFilter =
          digits === 1 ? `0${value[filter[selectedGrouping]].toString()}` : value[filter[selectedGrouping]].toString();
        return +(value.year.toString() + numberForSelectedFilter);
      });

      const groupedDict: Dictionary<HistogramType> = {};

      for (const value in groupedHistogramData) {
        groupedDict[value] = DashboardAssembler.sumObjectsByKey(...groupedHistogramData[value]);
      }

      return {
        data: histogramData.data,
        groupedData: values(groupedDict),
      };
    }
  }

  /**
   * Builds the histogram type object from the affected parts
   *
   * @private
   * @static
   * @param {AffectedPart} item
   * @return {HistogramType}
   * @memberof DashboardAssembler
   */
  private static buildHistogramObject(item: AffectedPart): HistogramType {
    const histogramType = {} as HistogramType;
    const propertyKey = item.qualityType;
    const isoDate = {
      day: DateTime.fromISO(item.date).c.day,
      month: DateTime.fromISO(item.date).c.month,
      year: DateTime.fromISO(item.date).c.year,
    };
    const splittedDate = item.date.split('-');
    histogramType[propertyKey] = item.numberOfAlerts;
    histogramType['date'] = `${splittedDate[2]}/${splittedDate[1]}`;
    histogramType['month'] = new Date(item.date).getMonth() + 1;
    histogramType['year'] = new Date(item.date).getFullYear();
    histogramType['week'] = DateTime.local(isoDate.year, isoDate.month, isoDate.day).weekNumber;
    return histogramType;
  }

  /**
   * Sums the quality types by a predefined grouping value
   *
   * @private
   * @static
   * @param {*} objects
   * @return {HistogramType}
   * @memberof DashboardAssembler
   */
  private static sumObjectsByKey(...objects): HistogramType {
    return objects.reduce((acc: HistogramType, value: HistogramType) => {
      for (const key in value) {
        if (has(value, key)) {
          if (keys(QualityTypes).includes(key) || key === 'total') {
            acc[key] = (acc[key] || 0) + value[key];
          } else {
            acc[key] = value[key];
          }
        }
      }

      return acc;
    }, {});
  }
}
