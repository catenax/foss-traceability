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

import { Export } from '../model/export.model';
import { Pagination } from '../model/pagination.model';
import { AssetFilter } from '../model/asset-filter.model';
import { AssetsList } from '../model/assets-list.model';
import { Asset } from 'src/app/shared/model/asset.model';
import { map } from 'lodash-es';
import { AssetAssembler } from 'src/app/shared/core/asset.assembler';

/**
 *
 *
 * @export
 * @class AssetsListAssembler
 */
export class AssetsListAssembler {
  public static assembleAssets(assets: AssetsList): Asset[] {
    const assetList: Asset[] = map(assets.data, (parentAsset: Asset) => {
      if (parentAsset.childComponents) {
        const childAssets: Asset[] = map(parentAsset.childComponents, (child: Asset) =>
          AssetAssembler.assembleAsset(child),
        );
        parentAsset.childComponents = [...childAssets];
      }
      return AssetAssembler.assembleAsset(parentAsset);
    });
    const sortedAssetList = [...assetList].sort(
      (a, b) => new Date(b.productionDateGmt).getTime() - new Date(a.productionDateGmt).getTime(),
    );
    return [...sortedAssetList];
  }
  /**
   * Creating a proper file to be exported
   *
   * @static
   * @param {Export} exportData
   * @return {File}
   * @memberof AssetsListAssembler
   */
  public static getFile(exportData: Export): File {
    const report = {
      listDataExcel: {
        TYPE: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
        EXTENSION: '.xlsx',
      },
      customsReportExcel: {
        TYPE: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
        EXTENSION: '.xlsx',
      },
      listDataPlainCSV: {
        TYPE: 'application/zip',
        EXTENSION: '.zip',
      },
      customsReportCSV: {
        TYPE: 'application/zip',
        EXTENSION: '.zip',
      },
    };
    const { buffer, reportType, fileName } = exportData;
    const parts: Uint8Array = new Uint8Array(buffer);
    const data: Blob = new Blob([parts], { type: report[reportType].TYPE });
    return new File([data], fileName + '_export_' + new Date().getTime() + report[reportType].EXTENSION);
  }

  /**
   * Assembling the initial value for the pagination
   *
   * @static
   * @param {number} currentPage
   * @param {AssetsList} assets
   * @return {Pagination}
   * @memberof AssetsListAssembler
   */
  public static setInitialPagination(currentPage: number, assets: AssetsList): Pagination {
    return {
      currentPage,
      pageIndex: currentPage,
      pageSize: assets.data.length,
      pageLength: assets.data.length,
      total: typeof assets.resultLength === 'undefined' ? 0 : assets.resultLength,
    };
  }

  /**
   * We need to increase by the page limit unless the total value is smaller
   *
   * @static
   * @param {number} currentPage
   * @param {Pagination} pagination
   * @return {Pagination}
   * @memberof AssetsListAssembler
   */
  public static nextPage(currentPage: number, pagination: Pagination): Pagination {
    const { pageIndex, pageSize, pageLength, total } = pagination;
    return {
      currentPage,
      pageIndex: total - pageSize < pageLength ? pageIndex + pageLength : pageSize + 1,
      pageSize: total - pageSize < pageLength ? total : pageSize + pageLength,
      total,
      pageLength,
    };
  }

  /**
   * We need to decrease by the page limit unless the total value equals the page size
   *
   * @static
   * @param {number} currentPage
   * @param {Pagination} pagination
   * @return {Pagination}
   * @memberof AssetsListAssembler
   */
  public static previousPage(currentPage: number, pagination: Pagination): Pagination {
    const { pageIndex, pageSize, pageLength, total } = pagination;
    return {
      currentPage,
      pageIndex: pageIndex - pageLength,
      pageSize: pageSize === total ? pageIndex - 1 : pageSize - pageLength,
      total,
      pageLength,
    };
  }

  /**
   * Creating a key value pair filter for the table tags
   *
   * @static
   * @param {AssetFilter} filters
   * @param {{ dateFrom: string; dateTo: string }} dateRange
   * @return {Array<{ key: string; value: string }>}
   * @memberof AssetsListAssembler
   */
  public static assembleFilters(
    filters: AssetFilter,
    dateRange: { dateFrom: string; dateTo: string },
  ): Array<{ key: string; value: string }> {
    const selectedFilters: Array<{ key: string; value: string }> = [];
    delete filters.type;
    filters.productionDateTo.value = dateRange.dateTo;
    filters.productionDateFrom.value = dateRange.dateFrom;
    for (const filter in filters) {
      if (filters[filter].value !== '') {
        selectedFilters.push({ key: filter, value: filters[filter].value });
      }
    }
    return selectedFilters;
  }
}
