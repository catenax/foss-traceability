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

import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AssetsListFacade } from '../../abstraction/assets-list.facade';

/**
 *
 *
 * @export
 * @class SupplierPartsComponent
 */
@Component({
  selector: 'app-supplier-parts',
  templateUrl: './supplier-parts.component.html',
  styleUrls: ['./supplier-parts.component.scss'],
})
export class SupplierPartsComponent {
  /**
   * Selected asset state
   *
   * @type {Observable<string>}
   * @memberof AssetsListComponent
   */
  public selectedAsset$: Observable<string>;

  /**
   * Active tab
   *
   * @type {string}
   * @memberof SupplierPartsComponent
   */
  public activeTab: string;

  /**
   * @constructor SupplierPartsComponent
   * @param {AssetsListFacade} assetsFacade
   * @memberof SupplierPartsComponent
   */
  constructor(private assetsFacade: AssetsListFacade) {
    this.selectedAsset$ = this.assetsFacade.selectedAsset$;
    this.activeTab = 'customer';
  }

  /**
   * Changing tab event
   *
   * @param {string} tab
   * @memberof SupplierPartsComponent
   */
  public getTab(tab: string): void {
    this.assetsFacade.resetSelectedAsset();
    this.activeTab = tab;
  }
}
