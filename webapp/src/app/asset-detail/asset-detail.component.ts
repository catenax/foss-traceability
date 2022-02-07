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

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AssetFacade } from '../shared/abstraction/asset-facade';
import { Asset } from '../shared/model/asset.model';
import { View } from '../shared/model/view.model';

/**
 *
 *
 * @export
 * @class AssetDetailComponent
 * @implements {OnChanges}
 */
@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.scss'],
})
export class AssetDetailComponent implements OnChanges {
  /**
   * Asset serial number input
   *
   * @type {string}
   * @memberof AssetDetailComponent
   */
  @Input() serialNumber: string;

  /**
   * Asset state
   *
   * @type {Observable<View<Asset>>}
   * @memberof AssetDetailComponent
   */
  public asset$: Observable<View<Asset>>;

  /**
   * Child component expanded flag
   *
   * @type {boolean}
   * @memberof AssetDetailComponent
   */
  public isChildComponentExpanded: boolean;

  /**
   * @constructor AssetDetailComponent.
   * @param {AssetFacade} assetFacade
   * @param {Router} router
   * @memberof AssetDetailComponent
   */
  constructor(private assetFacade: AssetFacade, private router: Router) {
    this.asset$ = this.assetFacade.asset$;
    this.isChildComponentExpanded = false;
  }

  /**
   * Angular lifecycle method - On Changes
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
   * Child expanded icon
   *
   * @return {string}
   * @memberof AssetDetailComponent
   */
  public getExpandedIcon(): string {
    return this.isChildComponentExpanded ? 'arrow-up-s-line' : 'arrow-down-s-line';
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
   * Asset state setter
   *
   * @param {Asset} asset
   * @return {void}
   * @memberof AssetDetailComponent
   */
  public setAsset(asset: Asset): void {
    const { partNameManufacturer, serialNumberCustomer } = asset;
    if (this.router.url.includes('find')) {
      this.assetFacade.setAsset(serialNumberCustomer);
    } else {
      // TODO: Evaluate active route state or save the url from previous page
      const sliceTail: number = this.router.url.includes('investigations') ? 4 : 3;
      const route = `${this.router.url
        .split('/')
        .slice(0, sliceTail)
        .join('/')}/${partNameManufacturer}`;
      this.router
        .navigate([route], {
          queryParams: { id: serialNumberCustomer },
        })
        .then();
    }
  }

  /**
   * Is asset request empty
   *
   * @param {Asset} asset
   * @return {boolean}
   * @memberof AssetDetailComponent
   */
  public isEmpty(asset: Asset): boolean {
    return this.assetFacade.isEmpty(asset);
  }

  /**
   * Create a quality alert
   *
   * @param {Asset} asset
   * @return {void}
   * @memberof AssetDetailComponent
   */
  public openModal(asset: Asset): void {
    this.assetFacade.openQualityAlertModal(asset);
  }

  /**
   * Is user allowed to edit quality type
   *
   * @param {Asset} asset
   * @return {boolean}
   * @memberof AssetDetailSidebarComponent
   */
  public isAllowedToEditQualityAlert(asset: Asset): boolean {
    return this.assetFacade.isMspidSameAsLoggedOne(asset);
  }
}
