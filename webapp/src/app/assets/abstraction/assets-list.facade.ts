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
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { Realm } from 'src/app/core/model/realm.model';
import { UserService } from 'src/app/core/user/user.service';
import { NotificationText } from 'src/app/shared/components/notifications/notification-message/notification-text';
import { NotificationService } from 'src/app/shared/components/notifications/notification.service';
import { SharedService } from 'src/app/shared/core/shared.service';
import { FilterService } from '../presentation/assets-list/assets-filter/filter.service';
import { AssetsListService } from '../core/assets-list.service';
import { AssetsListState } from '../core/assets-list.state';
import { Export, ExportResponse } from '../model/export.model';
import { Pagination } from '../model/pagination.model';
import { AssetFilter } from '../model/asset-filter.model';
import { saveAs } from 'file-saver';
import { AssetsList, fields } from '../model/assets-list.model';
import { View } from 'src/app/shared/model/view.model';
import { delay } from 'rxjs/operators';

/**
 *
 *
 * @export
 * @class AssetsListFacade
 */
@Injectable()
export class AssetsListFacade {
  /**
   * @constructor AssetsListFacade DI.
   * @param {AssetsListState} assetsState
   * @param {AssetsListService} assetsService
   * @param {FilterService} filterService
   * @param {UserService} userService
   * @param {SharedService} sharedService
   * @param {NotificationService} notificationService
   * @memberof AssetsListFacade
   */
  constructor(
    private assetsState: AssetsListState,
    private assetsService: AssetsListService,
    private filterService: FilterService,
    private userService: UserService,
    private sharedService: SharedService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Assets list state getter
   *
   * @readonly
   * @type {Observable<View<AssetsList>>}
   * @memberof AssetsListFacade
   */
  get assets$(): Observable<View<AssetsList>> {
    return this.assetsState.getAssets$.pipe(delay(0));
  }

  /**
   * Full assets state getter
   *
   * @readonly
   * @type {Observable<AssetsList>}
   * @memberof AssetsListFacade
   */
  get fullAssets$(): Observable<AssetsList> {
    return this.assetsState.getFullAssets$;
  }

  /**
   * Total of assets state getter
   *
   * @readonly
   * @type {Observable<number>}
   * @memberof AssetsListFacade
   */
  get totalOfAssets$(): Observable<number> {
    return this.assetsState.getTotalOfAssets$;
  }

  /**
   * Pagination state getter
   *
   * @readonly
   * @type {Observable<Pagination>}
   * @memberof AssetsListFacade
   */
  get pagination$(): Observable<Pagination> {
    return this.assetsState.getPagination$;
  }

  /**
   * Selected rows state getter
   *
   * @readonly
   * @type {Observable<Asset[]>}
   * @memberof AssetsListFacade
   */
  get selectedRows$(): Observable<unknown[]> {
    return this.assetsState.getSelectedRows$;
  }

  /**
   * Get selected rows snapshot
   *
   * @readonly
   * @type {unknown[]}
   * @memberof AssetsListFacade
   */
  get selectedRowsSnapshot(): unknown[] {
    return this.assetsState.getSelectRowsSnapshot;
  }

  /**
   * Selected asset state getter
   *
   * @readonly
   * @type {Observable<string>}
   * @memberof AssetsListFacade
   */
  get selectedAsset$(): Observable<string> {
    return this.assetsState.getSelectedAsset$;
  }

  /**
   * Selected asset state snapshot getter
   *
   * @readonly
   * @type {string}
   * @memberof AssetsListFacade
   */
  get selectedAssetSnapshot$(): string {
    return this.assetsState.getSelectedAssetSnapshot;
  }

  /**
   * Filters state getter
   *
   * @readonly
   * @type {Observable<Array<{ key: string; value: string }>>}
   * @memberof AssetsListFacade
   */
  get filters$(): Observable<Array<{ key: string; value: string }>> {
    return this.assetsState.getFilters$;
  }

  /**
   * Loading state getter
   *
   * @readonly
   * @type {Observable<boolean>}
   * @memberof AssetsListFacade
   */
  get loading$(): Observable<boolean> {
    return this.assetsState.getLoading$;
  }

  /**
   * Setting the filters with the last 31 days
   *
   * @param {string} queryType
   * @return {*}  {{
   *     productionDateFrom: { value: string };
   *     productionDateTo: { value: string };
   *     type: { value: string };
   *   }}
   * @memberof AssetsListFacade
   */
  public getInitialFilter(
    queryType: string,
  ): {
    productionDateFrom: { value: string };
    productionDateTo: { value: string };
    type: { value: string };
  } {
    return this.filterService.getFilter(queryType);
  }

  /**
   * Gets the filtered values
   *
   * @param {FormGroup} form
   * @param {string} queryType
   * @return {{ type: { value: string } }}
   * @memberof AssetsListFacade
   */
  public getFilter(form: FormGroup, queryType: string): { type: { value: string } } {
    return this.filterService.getModalFilters(form, queryType);
  }

  /**
   * Gets the form group
   *
   * @return {FormGroup}
   * @memberof AssetsListFacade
   */
  public getDefaultForm(): FormGroup {
    return this.filterService.getDefaultForm();
  }

  /**
   * Setting the end date if no value is passed
   *
   * @param {FormGroup} form
   * @return {void}
   * @memberof AssetsListFacade
   */
  public getMissingDate(form: FormGroup): void {
    return this.filterService.isEndDateMissing(form);
  }

  /**
   * Handling the different types of list (own or other)
   *
   * @return {Realm}
   * @memberof AssetsListFacade
   */
  public getOrgPreferences(): Realm {
    return this.userService.getOrgPreferences();
  }

  /**
   * Date formatter helper
   *
   * @param {string} date
   * @return {string}
   * @memberof AssetsListFacade
   */
  public getFormattedDate(date: string): string {
    return this.sharedService.formatDate(date);
  }

  /**
   * Api request to set the assets list state
   *
   * @param {{ type: { value: string } }} filter
   * @param {number} currentPage
   * @param {string} [page]
   * @return {void}
   * @memberof AssetsListFacade
   */
  public setAssets(filter: { type: { value: string } }, currentPage: number, page?: string): void {
    if (currentPage === -1) {
      this.setFullAssets(filter, currentPage, fields);
    } else {
      this.assetsState.setAssets({ loader: true });
      this.assetsService.getAssets(filter, currentPage, fields).subscribe(
        (assets: AssetsList) => {
          this.assetsState.setAssets({ data: assets });
          this.assetsState.setPagination(currentPage, assets, page);
          this.assetsState.setTotalOfAssets(typeof assets.resultLength === 'undefined' ? 0 : assets.resultLength);
        },
        error => this.assetsState.setAssets({ error }),
      );
    }
  }

  /**
   *  Api request to set the full assets list state
   *
   * @param {{ type: { value: string } }} filter
   * @param {number} currentPage
   * @param {string[]} totalAssetFields
   * @return {void}
   * @memberof AssetsListFacade
   */
  public setFullAssets(filter: { type: { value: string } }, currentPage: number, totalAssetFields: string[]): void {
    this.assetsState.setLoading(true);
    this.assetsService.getAssets(filter, currentPage, totalAssetFields).subscribe(
      (assets: AssetsList) => {
        this.assetsState.setFullAssets(assets);
        this.assetsState.setSelectedRows(assets.data);
        this.assetsState.setLoading(false);
      },
      error => this.assetsState.setAssets({ error }),
    );
  }

  /**
   * Setting the filters state
   *
   * @param {AssetFilter} filters
   * @return {void}
   * @memberof AssetsListFacade
   */
  public setFilters(filters: AssetFilter): void {
    const dateRange: { dateFrom: string; dateTo: string } = {
      dateFrom: this.getFormattedDate(filters.productionDateFrom.value),
      dateTo: this.getFormattedDate(filters.productionDateTo.value),
    };
    this.assetsState.setFilters(filters, dateRange);
  }

  /**
   * Setting the selected rows state
   *
   * @param {Asset[]} selectedRows
   * @return {void}
   * @memberof AssetsListFacade
   */
  public setSelectedRows(selectedRows: unknown[]): void {
    this.assetsState.setSelectedRows(selectedRows);
  }

  /**
   * Setting the selected assets state
   *
   * @param {string} selectedAsset
   * @return {void}
   * @memberof AssetsListFacade
   */
  public setSelectedAsset(selectedAsset: string): void {
    this.assetsState.setSelectedAsset(selectedAsset);
  }

  /**
   * Reset the selected asset to his initial state
   *
   * @return {void}
   * @memberof AssetsListFacade
   */
  public resetSelectedAsset(): void {
    this.assetsState.resetSelectedAsset();
  }

  /**
   * Setting the loading state
   *
   * @param {boolean} loading
   * @return {void}
   * @memberof AssetsListFacade
   */
  public setLoading(loading: boolean): void {
    this.assetsState.setLoading(loading);
  }

  /**
   * Resetting the assets list to their initial value
   *
   * @return {void}
   * @memberof AssetsListFacade
   */
  public resetAssets(): void {
    this.assetsState.resetAssets();
  }

  /**
   * Resetting the filters to their initial value
   *
   * @return {void}
   * @memberof AssetsListFacade
   */
  public resetFilters(): void {
    this.assetsState.resetFilters();
  }

  /**
   * Resetting the selected rows to their initial value
   *
   * @return {void}
   * @memberof AssetsListFacade
   */
  public resetSelectedRows(): void {
    this.assetsState.resetSelectedRows();
  }

  /**
   * Api request to get the file to be exported
   *
   * @param {{ type: { value: string } }} filter
   * @param {string} reportType
   * @param {string} queryType
   * @return {void}
   * @memberof AssetsListFacade
   */
  public exportFile(filter: { type: { value: string } }, reportType: string, queryType: string): void {
    this.notificationService.info(NotificationText.PreparingToDownload);
    this.assetsService.exportData(filter, reportType).subscribe((data: ExportResponse) => {
      const exportData: Export = {
        buffer: data.data.response.data,
        fileName: queryType,
        reportType,
      };
      saveAs(this.assetsState.getFileToExport(exportData));
    });
  }
}
