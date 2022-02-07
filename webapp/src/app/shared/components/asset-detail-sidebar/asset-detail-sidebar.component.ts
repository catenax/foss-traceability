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
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AssetFacade } from 'src/app/shared/abstraction/asset-facade';
import { Asset } from 'src/app/shared/model/asset.model';
import { View } from 'src/app/shared/model/view.model';

@Component({
  selector: 'app-asset-detail-sidebar',
  templateUrl: './asset-detail-sidebar.component.html',
  styleUrls: ['./asset-detail-sidebar.component.scss'],
})
export class AssetDetailSidebarComponent implements OnChanges {
  /**
   * Serial number
   *
   * @type {string}
   * @memberof AssetDetailComponent
   */
  @Input() serialNumber: string;

  /**
   * Asset query type
   *
   * @type {string}
   * @memberof AssetDetailComponent
   */
  @Input() assetType: string;

  /**
   * Page title
   *
   * @type {string}
   * @memberof AssetDetailComponent
   */
  @Input() title: string;

  /**
   * Close event emitter
   *
   * @type {EventEmitter}
   * @memberof AssetDetailComponent
   */
  @Output() closeEditPanelEvent = new EventEmitter();

  /**
   * Asset state
   *
   * @type {Observable<View<Asset>>}
   * @memberof AssetDetailComponent
   */
  public asset$: Observable<View<Asset>>;

  /**
   * @constructor AssetDetailSidebarComponent.
   * @param {AssetFacade} assetFacade
   * @param {Router} router
   * @param {ActivatedRoute} route
   * @memberof AssetDetailSidebarComponent
   */
  constructor(private assetFacade: AssetFacade, private router: Router, private route: ActivatedRoute) {
    this.asset$ = this.assetFacade.asset$.pipe(delay(1));
  }

  /**
   * Angular lifecycle method - Ng On Changes
   *
   * @param {SimpleChanges} changes
   * @return {void}
   * @memberof AssetDetailComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.serialNumber) {
      this.assetFacade.setAsset(changes.serialNumber.currentValue);
    }
  }

  /**
   * Dialog close event
   *
   * @return {void}
   * @memberof AssetDetailComponent
   */
  public dialogClose(): void {
    this.closeEditPanelEvent.emit();
  }

  /**
   * Copy serial number to clipboard
   *
   * @param {string} serialNumber
   * @return {void}
   * @memberof AssetDetailComponent
   */
  public copyToClipboard(serialNumber: string): void {
    this.assetFacade.copyToClipboard(serialNumber);
  }

  /**
   * Expanded icon handler
   *
   * @param {boolean} event
   * @return {string}
   * @memberof AssetDetailComponent
   */
  public getExpandedIcon(event: boolean): string {
    return event ? 'arrow-up-s-fill' : 'arrow-down-s-fill';
  }

  /**
   * Detail page route
   *
   * @param {Asset} asset
   * @return {void}
   * @memberof AssetDetailSidebarComponent
   */
  public navigateToDetailPage(asset: Asset): void {
    const { partNameManufacturer, serialNumberCustomer } = asset;

    this.router
      .navigate([partNameManufacturer], {
        relativeTo: this.route,
        queryParams: { id: serialNumberCustomer },
      })
      .then();
  }

  /**
   * Parent detail information
   *
   * @param {Asset} parent
   * @return {void}
   * @memberof AssetDetailSidebarComponent
   */
  public getParentDetails(parent: Asset): void {
    this.navigateToDetailPage(parent);
  }

  /**
   * Create a quality alert
   *
   * @param {Asset} asset
   * @return {void}
   * @memberof AssetDetailSidebarComponent
   */
  public openQualityAlertModal(asset: Asset): void {
    this.assetFacade.openQualityAlertModal(asset);
  }

  /**
   * Is user allowed to edit quality type
   *
   * @param {Asset} asset
   * @return {boolean}
   * @memberof AssetDetailSidebarComponent
   */
  public isAllowedToEdit(asset: Asset): boolean {
    return this.assetFacade.isMspidSameAsLoggedOne(asset);
  }
}
