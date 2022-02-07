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

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AssetsListFacade } from 'src/app/assets/abstraction/assets-list.facade';
import { AssetsList } from 'src/app/assets/model/assets-list.model';
import { realm } from 'src/app/core/api/api.service.properties';
import { InvestigationCreateComponent } from 'src/app/investigations/presentation/investigation-create/investigation-create.component';
import { InvestigationsRaiseAlertComponent } from 'src/app/investigations/presentation/investigations-raise-alert/investigations-raise-alert.component';
import { QualityAlertCreateComponent } from 'src/app/quality-alert/presentation/quality-alert-create/quality-alert-create.component';
import { Asset } from 'src/app/shared/model/asset.model';

/**
 *
 *
 * @export
 * @class TableSelectionComponent
 * @implements {OnChanges}
 */
@Component({
  selector: 'app-table-selection',
  templateUrl: './table-selection.component.html',
  styleUrls: ['./table-selection.component.scss'],
})
export class TableSelectionComponent implements OnChanges {
  /**
   * Total os assets
   *
   * @type {number}
   * @memberof TableSelectionComponent
   */
  @Input() totalOfAssets: number;

  /**
   * Selected rows
   *
   * @type {Asset[]}
   * @memberof TableSelectionComponent
   */
  @Input() selectedRows: Asset[];

  /**
   * Loading complete flag
   *
   * @type {boolean}
   * @memberof TableSelectionComponent
   */
  @Input() loadingComplete: boolean;

  /**
   * Form values
   *
   * @type {FormGroup}
   * @memberof TableSelectionComponent
   */
  @Input() form: FormGroup;

  /**
   * Query type
   *
   * @type {string}
   * @memberof TableSelectionComponent
   */
  @Input() queryType: string;

  /**
   * Clear selection event emitter
   *
   * @type {EventEmitter<boolean>}
   * @memberof TableSelectionComponent
   */
  @Output() selection: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Quality alert event emitter
   *
   * @type {EventEmitter<{ qualityType: string; selectedSerialNumbers: Asset[] }>}
   * @memberof TableSelectionComponent
   */
  @Output() qualityAlert: EventEmitter<{
    qualityType: string;
    assets: Asset[];
    description?: string;
    eventFlow?: string;
  }> = new EventEmitter<{
    qualityType: string;
    assets: Asset[];
    description?: string;
    eventFlow?: string;
  }>();

  @Output() investigationAlert: EventEmitter<{
    qualityType: string;
    assets: Asset[];
    description?: string;
    eventFlow?: string;
  }> = new EventEmitter<{
    qualityType: string;
    assets: Asset[];
    description?: string;
    eventFlow?: string;
  }>();

  /**
   * Is getting all assets flag
   *
   * @type {boolean}
   * @memberof TableSelectionComponent
   */
  public isGettingAllAssets = false;

  /**
   * Type of data (vehicles, parts, components)
   *
   * @type {string}
   * @memberof TableSelectionComponent
   */
  public typeOfData = 'parts';

  /**
   * Assets state
   *
   * @private
   * @type {Observable<AssetsList>}
   * @memberof TableSelectionComponent
   */
  private assets$: Observable<AssetsList>;

  /**
   * User selected assets
   *
   * @private
   * @type {Asset[]}
   * @memberof TableSelectionComponent
   */
  private selectedAssets: Asset[];

  /**
   * @constructor TableSelectionComponent.
   * @param {AssetsListFacade} assetsFacade
   * @param {MatDialog} dialog
   * @param {Router} router
   * @memberof TableSelectionComponent
   */
  constructor(private assetsFacade: AssetsListFacade, private dialog: MatDialog, private router: Router) {
    this.assets$ = this.assetsFacade.fullAssets$;
    this.assets$.subscribe((assets: AssetsList) => (this.selectedAssets = assets?.data));
  }

  /**
   * Angular lifecycle method - Ng On Changes
   *
   * @param {SimpleChanges} changes
   * @return {void}
   * @memberof TableSelectionComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedRows) {
      this.selectedAssets = changes.selectedRows.currentValue;
    }
  }

  /**
   * Emit request all assets event
   *
   * @return {void}
   * @memberof TableSelectionComponent
   */
  public getAssets(): void {
    this.isGettingAllAssets = true;
    this.assetsFacade.setAssets(this.assetsFacade.getFilter(this.form, this.queryType), -1);
  }

  /**
   * Get proper message for number of rows selected
   *
   * @param {number} row
   * @return {string}
   * @memberof TableSelectionComponent
   */
  public numberOfRowsSelected(row: number): string {
    return row === 1 ? `${row} ${this.typeOfData.slice(0, -1)}` : `${row} ${this.typeOfData}`;
  }

  /**
   * Clear selection event
   *
   * @return {void}
   * @memberof TableSelectionComponent
   */
  public clearSelection(): void {
    this.selection.emit(true);
    this.isGettingAllAssets = false;
  }

  /**
   * Investigation modal
   *
   * @return {void}
   * @memberof TableSelectionComponent
   */
  public openInvestigationModal(): void {
    const dialogRef = this.dialog.open(InvestigationCreateComponent, {
      width: '400px',
      panelClass: 'custom-dialog-container',
      data: {
        assets: this.selectedAssets,
      },
    });
    dialogRef.afterClosed().subscribe((data: { qualityType; assets: Asset[]; description?: string }) => {
      if (data) {
        const { qualityType, assets, description } = data;
        this.investigationAlert.emit({
          qualityType,
          assets,
          description,
          eventFlow: 'TOP-DOWN',
        });
      }
    });
  }

  /**
   * Change status event
   *
   * @return {void}
   * @memberof TableSelectionComponent
   */
  public openQualityAlertModal(): void {
    const dialogRef = this.router.url.includes('investigations')
      ? this.dialog.open(InvestigationsRaiseAlertComponent, {
          width: '1000px',
          panelClass: 'custom-dialog-container',
          data: {
            serialNumbers: this.selectedAssets,
          },
        })
      : this.dialog.open(QualityAlertCreateComponent, {
          width: '400px',
          panelClass: 'custom-dialog-container',
          data: {
            serialNumbers: this.selectedAssets,
          },
        });
    dialogRef
      .afterClosed()
      .subscribe((data: { qualityType: string; selectedSerialNumbers: Asset[]; description?: string }) => {
        if (data) {
          const { qualityType, selectedSerialNumbers, description } = data;
          const filteredSerialNumbers: Asset[] = selectedSerialNumbers.filter(
            asset => asset.qualityType !== qualityType,
          );
          this.qualityAlert.emit({ qualityType, assets: filteredSerialNumbers, description, eventFlow: 'BOTTOM-UP' });
        }
      });
  }

  /**
   * All of the parts selected belong to the logged user
   *
   * @param {Asset[]} selectedRows
   * @return {boolean}
   * @memberof TableSelectionComponent
   */
  public isOwnParts(selectedRows: Asset[]): boolean {
    const allPartsAreYours: boolean = selectedRows.every(
      asset => asset.mspid.toLocaleLowerCase() === realm[1].toLocaleLowerCase(),
    );
    return (this.queryType && this.queryType === 'own') || allPartsAreYours;
  }
}
