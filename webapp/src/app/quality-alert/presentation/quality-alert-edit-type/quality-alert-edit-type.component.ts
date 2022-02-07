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

import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map } from 'lodash-es';
import { QualityAlertFacade } from '../../abstraction/quality-alert.facade';

/**
 *
 *
 * @export
 * @class QualityAlertEditTypeComponent
 */
@Component({
  selector: 'app-quality-alert-edit-type',
  templateUrl: './quality-alert-edit-type.component.html',
  styleUrls: ['./quality-alert-edit-type.component.scss'],
})
export class QualityAlertEditTypeComponent {
  /**
   * Quality alert types
   *
   * @type {string[]}
   * @memberof QualityAlertEditTypeComponent
   */
  public types = ['Minor Issue', 'Major Issue', 'Critical Issue', 'Life-Threatening Issue'];

  /**
   * Update form
   *
   * @type {FormGroup}
   * @memberof QualityAlertEditTypeComponent
   */
  public updateForm: FormGroup;

  /**
   * @constructor QualityAlertEditTypeComponent
   * @param {MatDialogRef<QualityAlertEditTypeComponent>} dialogRef
   * @param {QualityAlertFacade} qualityAlertFacade
   * @param {string} alertId
   * @memberof QualityAlertEditTypeComponent
   */
  constructor(
    public dialogRef: MatDialogRef<QualityAlertEditTypeComponent>,
    public qualityAlertFacade: QualityAlertFacade,
    @Inject(MAT_DIALOG_DATA) public alertId: string,
  ) {
    this.updateForm = this.qualityAlertFacade.getQualityAlertUpdateForm;
  }

  /**
   * Dialog close event
   *
   * @return {void}
   * @memberof QualityAlertEditTypeComponent
   */
  public dialogClose(): void {
    this.dialogRef.close();
  }

  /**
   * Save update changes
   *
   * @return {void}
   * @memberof QualityAlertEditTypeComponent
   */
  public saveChanges(): void {
    const qualityType = this.updateForm
      .get('type')
      .value.toUpperCase()
      .split(' ')
      .slice(0, 1)
      .join();
    const { children, type } = this.qualityAlertFacade.groupedAlertSnapshot;
    const serialNumberList = map(children, 'serialNumberCustomer');
    this.qualityAlertFacade.updateQualityAlert(this.alertId, qualityType, serialNumberList, type);
    this.dialogRef.close();
  }
}
