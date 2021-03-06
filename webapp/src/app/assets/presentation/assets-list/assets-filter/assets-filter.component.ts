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

import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Filter } from '../../../model/asset-filter.model';

/**
 *
 *
 * @export
 * @class AssetsFilterComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-assets-filter',
  templateUrl: './assets-filter.component.html',
  styleUrls: ['./assets-filter.component.scss'],
})
export class AssetsFilterComponent implements OnInit {
  /**
   * Filter form
   *
   * @type {FormGroup}
   * @memberof AssetsFilterComponent
   */
  public filterForm: FormGroup;

  /**
   * Filter title
   *
   * @type {string}
   * @memberof AssetsFilterComponent
   */
  public title = '';

  /**
   * Filter max/min date
   *
   * @type {Date}
   * @memberof AssetsFilterComponent
   */
  public today = new Date();

  /**
   * Serial number report types
   *
   * @type {string[]}
   * @memberof AssetsFilterComponent
   */
  public serialNumberType = ['SINGLE', 'BATCH'];

  /**
   * @constructor AssetsFilterComponent
   * @param {Filter} assetsType
   * @param {MatDialogRef<AssetsFilterComponent>} dialogRef
   * @memberof AssetsFilterComponent
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public assetsType: Filter,
    private dialogRef: MatDialogRef<AssetsFilterComponent>,
  ) {
    dialogRef.disableClose = true;
    this.title = this.assetsType.type.charAt(0).toUpperCase() + this.assetsType.type.slice(1);
  }

  /**
   * Angular lifecycle method - Ng On Init
   *
   * @return {void}
   * @memberof AssetsFilterComponent
   */
  ngOnInit(): void {
    this.filterForm = this.assetsType.form;
  }

  /**
   * Filter event
   *
   * @param {Event} event
   * @return {void}
   * @memberof AssetsFilterComponent
   */
  public filterAssets(event: Event): void {
    event.preventDefault();
    if (this.filterForm.get('productionDateFrom').value !== '') {
      this.assetsType.cb();
      this.dialogRef.close();
    }
  }

  /**
   * Clear filters event
   *
   * @return {void}
   * @memberof AssetsFilterComponent
   */
  public clearFilters(): void {
    this.assetsType.clear();
  }

  /**
   * Helper method to get default dates
   *
   * @return {boolean}
   * @memberof AssetsFilterComponent
   */
  public isDefaultProductionDateRange(): boolean {
    return (
      this.filterForm.get('productionDateFrom').value === '' && this.filterForm.get('productionDateTo').value === ''
    );
  }

  /**
   * Dialog close event
   *
   * @return {void}
   * @memberof AssetsFilterComponent
   */
  public dialogClose(): void {
    this.dialogRef.close();
  }
}
