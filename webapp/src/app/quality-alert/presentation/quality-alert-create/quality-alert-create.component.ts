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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { filter, flatten, remove } from 'lodash-es';
import { Observable } from 'rxjs';
import { Asset } from 'src/app/shared/model/asset.model';
import { View } from 'src/app/shared/model/view.model';
import { QualityAlertFacade } from '../../abstraction/quality-alert.facade';
import { GroupedAlert } from '../../model/grouped-alerts.model';
import { QualityAlertChildren, QualityAlertTypes } from '../../model/quality-alert.model';

/**
 *
 *
 * @export
 * @class QualityAlertCreateComponent
 */
@Component({
  selector: 'app-quality-alert-create',
  templateUrl: './quality-alert-create.component.html',
  styleUrls: ['./quality-alert-create.component.scss'],
})
export class QualityAlertCreateComponent implements OnInit, OnDestroy {
  /**
   * Quality alert create form
   *
   * @type {FormGroup}
   * @memberof QualityAlertCreateComponent
   */
  public createForm: FormGroup;

  /**
   * Quality alert types
   *
   * @type {string[]}
   * @memberof QualityAlertCreateComponent
   */
  public types = ['Minor Issue', 'Major Issue', 'Critical Issue', 'Life-Threatening Issue'];

  /**
   * Has error flag
   *
   * @type {boolean}
   * @memberof QualityAlertCreateComponent
   */
  public hasError = false;

  /**
   * Are serial numbers already queued?
   *
   * @type {boolean}
   * @memberof QualityAlertCreateComponent
   */
  public alreadyQueued = false;

  /**
   * Queued alerts state
   *
   * @type {Observable<QualityAlert[]>}
   * @memberof QualityAlertCreateComponent
   */
  public queuedQualityAlerts$: Observable<View<GroupedAlert[]>>;

  /**
   * Selected assets
   *
   * @type {Asset[]}
   * @memberof QualityAlertCreateComponent
   */
  public assets: Asset[];

  /**
   * Quality alert mapped serial numbers
   *
   * @type {string[]}
   * @memberof QualityAlertCreateComponent
   */
  public qualityAlertSerialNumbers: string[];

  /**
   * @constructor QualityAlertCreateComponent
   * @param {MatDialogRef<QualityAlertCreateComponent>} dialogRef
   * @param {QualityAlertFacade} qualityAlertFacade
   * @param {{ serialNumbers: Asset[] }} data
   * @memberof QualityAlertCreateComponent
   */
  constructor(
    public dialogRef: MatDialogRef<QualityAlertCreateComponent>,
    private qualityAlertFacade: QualityAlertFacade,
    @Inject(MAT_DIALOG_DATA) public data: { serialNumbers: Asset[]; eventFlow: string },
  ) {
    this.createForm = this.qualityAlertFacade.getQualityAlertCreateForm;
    this.queuedQualityAlerts$ = this.qualityAlertFacade.qualityAlerts$;
    this.queuedQualityAlerts$.subscribe((alerts: View<GroupedAlert[]>) => {
      if (alerts.data) {
        const pendingAlerts: GroupedAlert[] = filter(alerts.data, alert => alert.status === QualityAlertTypes.PENDING);
        const qualityAlerts: GroupedAlert[] = pendingAlerts.filter(alert =>
          remove(alert.children, part => part.status !== QualityAlertTypes.PENDING),
        );
        const alertsChildren: QualityAlertChildren[] = flatten(qualityAlerts.map(alerts => alerts.children));
        this.qualityAlertSerialNumbers = alertsChildren.map(alert => alert.serialNumberCustomer);
        this.assets = this.data.serialNumbers.filter(asset =>
          this.qualityAlertSerialNumbers.includes(asset.serialNumberCustomer),
        );
      }
    });
  }

  /**
   * Angular lifecycle method - Ng on init
   *
   * @return {void}
   * @memberof QualityAlertCreateComponent
   */
  ngOnInit(): void {
    this.qualityAlertFacade.setQualityAlerts();
  }

  /**
   * Angular lifecycle method - Ng on destroy
   *
   * @return {void}
   * @memberof QualityAlertCreateComponent
   */
  ngOnDestroy(): void {
    this.assets = undefined;
  }

  /**
   * Dialog close event
   *
   * @return {void}
   * @memberof QualityAlertCreateComponent
   */
  public dialogClose(): void {
    this.hasError = false;
    this.alreadyQueued = false;
    this.assets = [];
    this.dialogRef.close();
  }

  /**
   * Add to queue action event
   *
   * @return {void}
   * @memberof QualityAlertCreateComponent
   */
  public addToQueue(): void {
    const qualityType = this.createForm
      .get('type')
      .value.toUpperCase()
      .split(' ')
      .slice(0, 1)
      .join();

    const queuedAssets: Asset[] = this.data.serialNumbers.filter(
      asset =>
        !this.qualityAlertSerialNumbers.includes(asset.serialNumberCustomer) && asset.qualityType !== qualityType,
    );

    if (this.hasError) {
      this.hasError = true;
    } else {
      if (queuedAssets.length === 0) {
        this.alreadyQueued = true;
        this.hasError = false;
      } else {
        this.dialogRef.close({
          qualityType: qualityType,
          selectedSerialNumbers: queuedAssets,
          description: this.createForm.get('description').value,
          eventFlow: this.data.eventFlow,
        });
      }
    }
  }

  /**
   * Assets already in the queued list
   *
   * @return {boolean}
   * @memberof QualityAlertCreateComponent
   */
  public alreadyQueuedSerialNumbers(): boolean {
    if (this.assets) {
      return this.assets.some(asset => this.qualityAlertSerialNumbers.includes(asset.serialNumberCustomer));
    }
  }
}
