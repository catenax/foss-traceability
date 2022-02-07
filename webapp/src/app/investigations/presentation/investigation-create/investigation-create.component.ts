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
import { Asset } from 'src/app/shared/model/asset.model';
import { InvestigationsFacade } from '../../abstraction/investigations.facade';

@Component({
  selector: 'app-investigation-create',
  templateUrl: './investigation-create.component.html',
  styleUrls: ['./investigation-create.component.scss'],
})
export class InvestigationCreateComponent {
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
   * Quality investigation form
   *
   * @type {FormGroup}
   * @memberof InvestigationCreateComponent
   */
  public investigationForm: FormGroup;

  /**
   * @constructor InvestigationCreateComponent.
   * @param {MatDialogRef<InvestigationCreateComponent>} dialogRef
   * @param {InvestigationsFacade} investigationFacade
   * @param {{ qualityType: string; assets: Asset[]; eventFlow?: string }} data
   * @memberof InvestigationCreateComponent
   */
  constructor(
    public dialogRef: MatDialogRef<InvestigationCreateComponent>,
    private investigationFacade: InvestigationsFacade,
    @Inject(MAT_DIALOG_DATA) public data: { qualityType: string; assets: Asset[]; eventFlow?: string },
  ) {
    this.investigationForm = this.investigationFacade.investigationForm;
  }

  /**
   * Dialog close event
   *
   * @return {void}
   * @memberof QualityAlertCreateComponent
   */
  public dialogClose(): void {
    this.dialogRef.close();
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

  /**
   * Add quality investigation to the queue
   *
   * @return {void}
   * @memberof InvestigationCreateComponent
   */
  public addToQueue(): void {
    this.dialogRef.close({
      qualityType: 'QUESTIONABLE',
      assets: this.data.assets,
      description: this.investigationForm.get('description').value,
      eventFlow: this.data.eventFlow,
    });
  }
}
