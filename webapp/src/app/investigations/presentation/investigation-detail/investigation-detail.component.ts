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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Table } from 'src/app/shared/components/table/table';
import { InvestigationsFacade } from '../../abstraction/investigations.facade';
import { QualityInvestigation } from '../../model/quality-investigation.model';
import { PartsTableBuilder } from '../../builder/parts-table.builder';
import { Observable } from 'rxjs';
import { Asset } from 'src/app/shared/model/asset.model';
import { AssetFilter } from 'src/app/assets/model/asset-filter.model';
import { View } from 'src/app/shared/model/view.model';
import { QualityAlertFacade } from 'src/app/quality-alert/abstraction/quality-alert.facade';
import { LayoutFacade } from 'src/app/shared/abstraction/layout-facade';
import { SelectionModel } from '@angular/cdk/collections';
import { PartsTableQueuedBuilder } from '../../builder/parts-table-queued.builder';
import { TableFacade } from 'src/app/shared/components/table/table.facade';

/**
 *
 *
 * @export
 * @class InvestigationDetailComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-investigation-detail',
  templateUrl: './investigation-detail.component.html',
  styleUrls: ['./investigation-detail.component.scss'],
})
export class InvestigationDetailComponent implements OnInit, OnDestroy {
  /**
   * Quality investigation
   *
   * @type {QualityInvestigation}
   * @memberof InvestigationDetailComponent
   */
  public qualityInvestigation: QualityInvestigation;

  /**
   * Quality investigation status
   *
   * @type {Observable<string>}
   * @memberof InvestigationDetailComponent
   */
  public investigationStatus$: Observable<string>;

  /**
   * Parts table
   *
   * @type {Table}
   * @memberof InvestigationDetailComponent
   */
  public partsTable: Table;

  /**
   * Parts state
   *
   * @type {Observable<View<Asset[]>>}
   * @memberof InvestigationDetailComponent
   */
  public parts$: Observable<View<Asset[]>>;

  /**
   * Flag to remove the selected rows
   *
   * @private
   * @type {boolean}
   * @memberof InvestigationDetailComponent
   */
  private removeSelectedRows: boolean;

  /**
   * Selected asset state
   *
   * @type {Observable<string>}
   * @memberof InvestigationDetailComponent
   */
  public selectedAsset$: Observable<string>;

  /**
   * Table selected rows
   *
   * @type {Asset[]}
   * @memberof InvestigationDetailComponent
   */
  public selectedRows: Asset[];

  /**
   * Is layout sidebar expanded
   *
   * @type {Observable<boolean>}
   * @memberof InvestigationDetailComponent
   */
  public isSideBarExpanded$: Observable<boolean>;

  /**
   * Is alert ready to delete state
   *
   * @type {Observable<boolean>}
   * @memberof InvestigationDetailComponent
   */
  public isAlertReadyToDelete$: Observable<boolean>;

  /**
   * @constructor InvestigationDetailComponent
   * @param {ActivatedRoute} route
   * @param {InvestigationsFacade} investigationsFacade
   * @param {QualityAlertFacade} qualityAlertFacade
   * @param {AssetsListFacade} assetsFacade
   * @param {LayoutFacade} layoutFacade
   * @memberof InvestigationDetailComponent
   */
  constructor(
    private route: ActivatedRoute,
    private investigationsFacade: InvestigationsFacade,
    private qualityAlertFacade: QualityAlertFacade,
    private tableFacade: TableFacade,
    private layoutFacade: LayoutFacade,
  ) {
    this.investigationStatus$ = this.investigationsFacade.investigationStatus$;
    this.subscribeToParams();
    this.partsTable =
      +localStorage.getItem('tabIndex') !== 0 ? PartsTableQueuedBuilder.getTable() : PartsTableBuilder.getTable();
    this.parts$ = this.investigationsFacade.parts$;
    this.selectedAsset$ = this.tableFacade.selectedAsset$;
    this.isSideBarExpanded$ = this.layoutFacade.isSideBarExpanded$;
    this.isAlertReadyToDelete$ = this.qualityAlertFacade.isAlertReadyToDelete$;
    this.selectedRows = [];
    this.removeSelectedRows = false;
    this.deleteAlertWhenReady();
  }

  /**
   * Angular lifecycle method - On Init
   *
   * @return {void}
   * @memberof InvestigationDetailComponent
   */
  ngOnInit(): void {
    const filter: AssetFilter = {
      serialNumberCustomerList: { value: this.qualityInvestigation.affectedSerialNumbers },
      type: { value: 'all' },
    };
    this.investigationsFacade.setParts(filter);
  }

  /**
   * Angular lifecycle method - On Destroy
   *
   * @return {void}
   * @memberof InvestigationDetailComponent
   */
  ngOnDestroy(): void {
    this.clearSelection();
    this.closeSideBar();
  }

  /**
   * Commit a quality investigation
   *
   * @param {string[]} alertIds
   * @return {void}
   * @memberof InvestigationDetailComponent
   */
  public commitQualityInvestigation(alertIds: string[]): void {
    this.investigationsFacade.commitQualityInvestigations(alertIds);
  }

  /**
   * Delete a quality investigation
   *
   * @param {string[]} alertIds
   * @return {void}
   * @memberof InvestigationDetailComponent
   */
  public deleteQualityInvestigation(alertIds: string[]): void {
    this.investigationsFacade.deleteQualityInvestigation(alertIds);
  }

  /**
   * Request a quality investigation
   *
   * @param {{
   *     qualityType: string;
   *     assets: Asset[];
   *     description?: string;
   *     eventFlow?: string;
   *   }} event
   * @return {void}
   * @memberof InvestigationDetailComponent
   */
  public changeQualityInvestigationType(event: {
    qualityType: string;
    assets: Asset[];
    description?: string;
    eventFlow?: string;
  }): void {
    this.createAlert(event);
  }

  /**
   * Change quality type request
   *
   * @param {{
   *     qualityType: string;
   *     assets: Asset[];
   *     description?: string;
   *     eventFlow?: string;
   *   }} event
   * @memberof InvestigationDetailComponent
   */
  public changeQualityType(event: {
    qualityType: string;
    assets: Asset[];
    description?: string;
    eventFlow?: string;
  }): void {
    this.createAlert(event);
  }

  /**
   * Clear table selection event
   *
   * @return {void}
   * @memberof InvestigationDetailComponent
   */
  public clearSelection(): void {
    this.selectedRows = [];
    this.removeSelectedRows = !this.removeSelectedRows;
  }

  /**
   * Close sidebar
   *
   * @return {void}
   * @memberof InvestigationDetailComponent
   */
  public closeSideBar(): void {
    this.tableFacade.setSelectedAsset(undefined);
  }

  /**
   * Create any type of alert
   *
   * @private
   * @param {{ qualityType: string; assets: Asset[]; description?: string; eventFlow?: string }} event
   * @return {void}
   * @memberof InvestigationDetailComponent
   */
  private createAlert(event: { qualityType: string; assets: Asset[]; description?: string; eventFlow?: string }): void {
    const serialNumbers: string[] = event.assets.map(value => value.serialNumberCustomer);
    this.qualityAlertFacade.createQualityAlert(
      event.qualityType.toLocaleUpperCase(),
      true,
      serialNumbers,
      event.description,
      event.eventFlow,
      'investigations',
    );
  }

  /**
   * Subscribe to route params
   *
   * @private
   * @return {void}
   * @memberof InvestigationDetailComponent
   */
  private subscribeToParams(): void {
    this.route.params.subscribe(params => {
      this.qualityInvestigation = this.investigationsFacade.getInvestigationById(params['id']);
      this.investigationsFacade.setInvestigationStatus(this.qualityInvestigation.status);
    });
  }

  /**
   * Delete current alert
   *
   * @private
   * @return {void}
   * @memberof InvestigationDetailComponent
   */
  private deleteAlertWhenReady(): void {
    this.isAlertReadyToDelete$.subscribe((isReady: boolean) => {
      if (isReady) this.deleteQualityInvestigation([this.qualityInvestigation.alertId]);
    });
  }

  public getSelectedRows(rows: SelectionModel<unknown>): void {
    this.selectedRows = rows.selected as Asset[];
  }
}
