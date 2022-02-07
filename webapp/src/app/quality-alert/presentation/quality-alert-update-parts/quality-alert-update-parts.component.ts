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

import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map } from 'lodash-es';
import { Observable } from 'rxjs';
import { realm } from 'src/app/core/api/api.service.properties';
import { AssetFacade } from 'src/app/shared/abstraction/asset-facade';
import { Table } from 'src/app/shared/components/table/table';
import { TableActions } from 'src/app/shared/components/table/table.actions';
import { Asset } from 'src/app/shared/model/asset.model';
import { QualityAlertFacade } from '../../abstraction/quality-alert.facade';
import { UpdateQualityAlertTableBuilder } from '../../builder/update-quality-alert-table.builder';
import { GroupedAlert } from '../../model/grouped-alerts.model';
import { QualityAlertChildren } from '../../model/quality-alert.model';

/**
 *
 *
 * @export
 * @class QualityAlertUpdatePartsComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-quality-alert-update-parts',
  templateUrl: './quality-alert-update-parts.component.html',
  styleUrls: ['./quality-alert-update-parts.component.scss'],
})
export class QualityAlertUpdatePartsComponent implements OnInit {
  /**
   * Serial number search term
   *
   * @type {ElementRef}
   * @memberof QualityAlertUpdatePartsComponent
   */
  @ViewChild('serialNumber', { read: ElementRef, static: true })
  serialNumber: ElementRef;

  /**
   * Quality alert children
   *
   * @type {QualityAlertChildren[]}
   * @memberof QualityAlertUpdatePartsComponent
   */
  public qualityAlert: QualityAlertChildren[];

  /**
   * Parts table
   *
   * @type {Table}
   * @memberof QualityAlertUpdatePartsComponent
   */
  public table: Table;

  /**
   * Error message state
   *
   * @type {Observable<boolean>}
   * @memberof QualityAlertUpdatePartsComponent
   */
  public errorMessage$: Observable<boolean>;

  /**
   * Is table empty flag
   *
   * @type {boolean}
   * @memberof QualityAlertUpdatePartsComponent
   */
  public isEmptyList: boolean;

  /**
   * @constructor QualityAlertUpdatePartsComponent
   * @param {MatDialogRef<QualityAlertUpdatePartsComponent>} dialogRef
   * @param {AssetFacade} assetFacade
   * @param {QualityAlertFacade} qualityAlertFacade
   * @param {QualityAlertChildren[]} data
   * @memberof QualityAlertUpdatePartsComponent
   */
  constructor(
    public dialogRef: MatDialogRef<QualityAlertUpdatePartsComponent>,
    private assetFacade: AssetFacade,
    private qualityAlertFacade: QualityAlertFacade,
    @Inject(MAT_DIALOG_DATA) public data: QualityAlertChildren[],
  ) {
    this.table = UpdateQualityAlertTableBuilder.getQueuedTable();
    this.qualityAlert = this.data;
    this.errorMessage$ = this.qualityAlertFacade.updateErrorMessage$;
    this.isEmptyList = false;
  }

  /**
   * Angular lifecycle ng on init
   *
   * @return {void}
   * @memberof QualityAlertUpdatePartsComponent
   */
  ngOnInit(): void {
    this.qualityAlertFacade.setUpdateErrorMessage(false);
  }

  /**
   * Table actions emitter
   *
   * @param {TableActions} event
   * @return {void}
   * @memberof QualityAlertUpdatePartsComponent
   */
  public tableActions(event: TableActions): void {
    const row = event.row as Asset;
    this.qualityAlert = this.qualityAlert.filter(value => value.serialNumberCustomer !== row.serialNumberCustomer);
  }

  /**
   * Add parts to a quality alert
   *
   * @return {void}
   * @memberof QualityAlertUpdatePartsComponent
   */
  public addPart(): void {
    this.isEmptyList = false;
    this.assetFacade.getAsset(this.serialNumber.nativeElement.value).subscribe(
      (asset: Asset) => {
        const alert: GroupedAlert = this.qualityAlertFacade.groupedAlertSnapshot;
        const serialNumberCustomerList: string[] = map(alert.children, 'serialNumberCustomer');
        if (
          !this.assetFacade.isEmpty(asset) &&
          asset.mspid.toLocaleUpperCase() === realm[1].toLocaleUpperCase() &&
          !serialNumberCustomerList.includes(asset.serialNumberCustomer)
        ) {
          const child: QualityAlertChildren = {
            alertId: '',
            partNameManufacturer: asset.partNameManufacturer,
            partNumberManufacturer: asset.partNumberManufacturer,
            serialNumberCustomer: asset.serialNumberCustomer,
            childSerialNumberCustomer: '',
            type: 'Raised',
            actions: [{ role: 'write', icon: 'delete-bin-line', label: 'Delete serial number' }],
            status: '',
          };
          this.qualityAlert = [...this.qualityAlert, { ...child }];
          this.qualityAlertFacade.setUpdateErrorMessage(false);
          this.isEmptyList = false;
        } else {
          this.qualityAlertFacade.setUpdateErrorMessage(true);
        }
      },
      () => this.qualityAlertFacade.setUpdateErrorMessage(true),
    );
  }

  /**
   * Dialog close event
   *
   * @return {void}
   * @memberof QualityAlertUpdatePartsComponent
   */
  public dialogClose(): void {
    this.dialogRef.close();
  }

  /**
   * Update quality alert with part changes
   *
   * @return {void}
   * @memberof QualityAlertUpdatePartsComponent
   */
  public updateQualityAlert(): void {
    const alert: GroupedAlert = this.qualityAlertFacade.groupedAlertSnapshot;
    const serialNumberCustomerList: string[] = map(this.qualityAlert, 'serialNumberCustomer');

    if (serialNumberCustomerList.length > 0) {
      this.qualityAlertFacade.updateQualityAlert(
        alert.alertId,
        alert.qualityType,
        serialNumberCustomerList,
        alert.type,
        this.qualityAlert,
      );
      this.dialogClose();
    } else {
      this.isEmptyList = true;
    }
  }
}
