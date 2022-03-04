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
import { State } from 'src/app/shared/model/state';
import { View } from 'src/app/shared/model/view.model';
import { AssetFilter } from '../model/asset-filter.model';
import { AssetsList } from '../model/assets-list.model';
import { Export } from '../model/export.model';
import { Pagination } from '../model/pagination.model';
import { AssetsListAssembler } from './assets-list.assembler';

/**
 * Asset list state management
 *
 * @export
 * @class AssetsListState
 */
@Injectable()
export class AssetsListState {
  /**
   * Asset list state
   *
   * @private
   * @readonly
   * @type {State<View<AssetsList>>}
   * @memberof AssetsListState
   */
  private readonly assetsList$: State<View<AssetsList>> = new State<View<AssetsList>>({ loader: true });

  /**
   * Assets with no pagination state
   *
   * @private
   * @readonly
   * @type {State<AssetsList>}
   * @memberof AssetsListState
   */
  private readonly fullAssets$: State<AssetsList> = new State<AssetsList>(undefined);

  /**
   * Pagination state
   *
   * @private
   * @readonly
   * @type {State<Pagination>}
   * @memberof AssetsListState
   */
  private readonly pagination$: State<Pagination> = new State<Pagination>(undefined);

  /**
   * Total of assets state
   *
   * @private
   * @readonly
   * @type {State<number>}
   * @memberof AssetsListState
   */
  private readonly totalOfAssets$: State<number> = new State<number>(0);

  /**
   * Filters state
   *
   * @private
   * @readonly
   * @type {State<Array<{ key: string; value: string }>>}
   * @memberof AssetsListState
   */
  private readonly filters$: State<Array<{ key: string; value: string }>> = new State<
    Array<{ key: string; value: string }>
  >([]);

  /**
   * Loading state
   *
   * @private
   * @readonly
   * @type {State<boolean>}
   * @memberof AssetsListState
   */
  private readonly loading$: State<boolean> = new State<boolean>(false);

  /**
   * Assets list getter
   *
   * @readonly
   * @type {Observable<View<AssetsList>>}
   * @memberof AssetsListState
   */
  get getAssets$(): Observable<View<AssetsList>> {
    return this.assetsList$.observable;
  }

  /**
   *Full assets getter
   *
   * @readonly
   * @type {Observable<AssetsList>}
   * @memberof AssetsListState
   */
  get getFullAssets$(): Observable<AssetsList> {
    return this.fullAssets$.observable;
  }

  /**
   * Pagination getter
   *
   * @readonly
   * @type {Observable<Pagination>}
   * @memberof AssetsListState
   */
  get getPagination$(): Observable<Pagination> {
    return this.pagination$.observable;
  }

  /**
   * Total of assets getter
   *
   * @readonly
   * @type {Observable<number>}
   * @memberof AssetsListState
   */
  get getTotalOfAssets$(): Observable<number> {
    return this.totalOfAssets$.observable;
  }

  /**
   * Filters getter
   *
   * @readonly
   * @type {Observable<Array<{ key: string; value: string }>>}
   * @memberof AssetsListState
   */
  get getFilters$(): Observable<Array<{ key: string; value: string }>> {
    return this.filters$.observable;
  }

  /**
   * Loading getter
   *
   * @readonly
   * @type {Observable<boolean>}
   * @memberof AssetsListState
   */
  get getLoading$(): Observable<boolean> {
    return this.loading$.observable;
  }

  /**
   * Assemble file to be exported
   *
   * @param {Export} exportData
   * @return {File}
   * @memberof AssetsListState
   */
  public getFileToExport(exportData: Export): File {
    return AssetsListAssembler.getFile(exportData);
  }

  /**
   * Updates the assets list state
   *
   * @param {View<AssetsList>} assets
   * @return {void}
   * @memberof AssetsListState
   */
  public setAssets(assets: View<AssetsList>): void {
    const assetsView: View<AssetsList> = {
      data: assets.data && {
        nextPage: assets.data.nextPage,
        resultLength: assets.data.resultLength,
        data: assets.data && AssetsListAssembler.assembleAssets(assets.data),
      },
      loader: assets.loader,
      error: assets.error,
    };

    this.assetsList$.update(assetsView);
  }

  /**
   * Updates the full assets list state
   *
   * @param {AssetsList} assets
   * @return {void}
   * @memberof AssetsListState
   */
  public setFullAssets(assets: AssetsList): void {
    this.fullAssets$.update(assets);
  }

  /**
   * Updates the pagination state
   *
   * @param {number} currentPage
   * @param {AssetsList} assets
   * @param {string} page
   * @return {void}
   * @memberof AssetsListState
   */
  public setPagination(currentPage: number, assets: AssetsList, page: string): void {
    const pagination: Pagination = this.pagination$.snapshot;
    const currentPagination = {
      firstPage: this.setInitialPage(currentPage, assets),
      nextPage: this.setNextPage(currentPage, pagination),
      previousPage: this.setPreviousPage(currentPage, pagination),
    };
    this.pagination$.update(currentPagination[page]);
  }

  /**
   * Updates the total of assets state
   *
   * @param {number} total
   * @return {void}
   * @memberof AssetsListState
   */
  public setTotalOfAssets(total: number): void {
    this.totalOfAssets$.update(total);
  }

  /**
   * Updates the filters state
   *
   * @param {AssetFilter} filters
   * @param {{ dateFrom: string; dateTo: string }} dateRange
   * @return {void}
   * @memberof AssetsListState
   */
  public setFilters(filters: AssetFilter, dateRange: { dateFrom: string; dateTo: string }): void {
    const selectedFilters: { key: string; value: string }[] = AssetsListAssembler.assembleFilters(filters, dateRange);
    this.filters$.update(selectedFilters);
  }

  /**
   * Updates the loading state
   *
   * @param {boolean} loading
   * @return {void}
   * @memberof AssetsListState
   */
  public setLoading(loading: boolean): void {
    this.loading$.update(loading);
  }

  /**
   * Resets the assets list state to the initial value
   *
   * @return {void}
   * @memberof AssetsListState
   */
  public resetAssets(): void {
    this.assetsList$.reset();
  }

  /**
   * Resets the filters state to the initial value
   *
   * @return {void}
   * @memberof AssetsListState
   */
  public resetFilters(): void {
    this.filters$.reset();
  }

  /**
   * Assembles the initial page values
   *
   * @private
   * @param {number} currentPage
   * @param {AssetsList} assets
   * @return {Pagination}
   * @memberof AssetsListState
   */
  private setInitialPage(currentPage: number, assets: AssetsList): Pagination {
    return AssetsListAssembler.setInitialPagination(currentPage, assets);
  }

  /**
   * Assembles the next page values
   *
   * @private
   * @param {number} currentPage
   * @param {Pagination} pagination
   * @return {Pagination}
   * @memberof AssetsListState
   */
  private setNextPage(currentPage: number, pagination: Pagination): Pagination {
    if (pagination) {
      return AssetsListAssembler.nextPage(currentPage, pagination);
    }
  }

  /**
   * Assembles the previous page values
   *
   * @private
   * @param {number} currentPage
   * @param {Pagination} pagination
   * @return {Pagination}
   * @memberof AssetsListState
   */
  private setPreviousPage(currentPage: number, pagination: Pagination): Pagination {
    if (pagination) {
      return AssetsListAssembler.previousPage(currentPage, pagination);
    }
  }
}
