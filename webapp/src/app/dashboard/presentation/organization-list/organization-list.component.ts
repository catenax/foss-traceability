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

import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AssetsPerPlant } from '../../model/assets-per-plant.model';

/**
 *
 *
 * @export
 * @class OrganizationListComponent
 * @implements {OnChanges}
 */
@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class OrganizationListComponent implements OnChanges {
  /**
   * Assets per plant list
   *
   * @type {AssetsPerPlant[]}
   * @memberof OrganizationListComponent
   */
  @Input() assetsPerPlant: AssetsPerPlant[];

  /**
   * Filtered list of assets per plant
   *
   * @type {AssetsPerPlant[]}
   * @memberof OrganizationListComponent
   */
  public filteredAssetsPerPlant = [];

  /**
   * Page length
   *
   * @type {number}
   * @memberof OrganizationListComponent
   */
  public pageLength = 0;

  /**
   * Page size
   *
   * @type {number}
   * @memberof OrganizationListComponent
   */
  public pageSize = 5;

  /**
   * Angular lifecycle method - Ng on changes
   *
   * @param {SimpleChanges} changes
   * @return {void}
   * @memberof OrganizationListComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.assetsPerPlant.currentValue) {
      this.pageLength = this.assetsPerPlant.length;
      this.filteredAssetsPerPlant = this.assetsPerPlant.slice((0 + 1 - 1) * this.pageSize).slice(0, this.pageSize);
    }
  }

  /**
   * Pagination event for page changes
   *
   * @param {PageEvent} event
   * @return {void}
   * @memberof OrganizationListComponent
   */
  public pageChangeEvent(event: PageEvent): void {
    const offset = (event.pageIndex + 1 - 1) * event.pageSize;
    this.filteredAssetsPerPlant = this.assetsPerPlant.slice(offset).slice(0, event.pageSize);
  }
}
