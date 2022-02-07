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

import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../core/api/api.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Asset, AssetResponse } from '../model/asset.model';
import { AuthService } from 'src/app/core/auth/auth.service';

/**
 *
 *
 * @export
 * @class AssetService
 */
@Injectable({
  providedIn: 'root',
})
export class AssetService {
  /**
   * MSPID api
   *
   * @private
   * @type {{ laapi: string; aems: string }}
   * @memberof AclService
   */
  private url: { laapi: string; aems: string };

  /**
   * @constructor AssetService (DI)
   * @param {ApiService} apiService
   * @memberof AssetService
   */
  constructor(private apiService: ApiService, private authService: AuthService) {
    this.url = this.authService.getUrl();
  }

  /**
   * Get asset request
   *
   * @param {string} serialNumberCustomer
   * @return {Observable<Asset>}
   * @memberof AssetService
   */
  public getAsset(serialNumberCustomer: string): Observable<Asset> {
    return this.apiService
      .getBy<AssetResponse>(
        `${this.url.laapi}off-hlf-db/get-asset-detail?`,
        new HttpParams().set('serialNumberCustomer', encodeURIComponent(serialNumberCustomer)),
      )
      .pipe(map((asset: AssetResponse) => asset.data));
  }

  /**
   * Get parent request
   *
   * @param {string} serialNumberCustomer
   * @return {Observable<Asset>}
   * @memberof AssetService
   */
  public getParent(serialNumberCustomer: string): Observable<Asset> {
    return this.apiService
      .getBy<AssetResponse>(
        `${this.url.laapi}off-hlf-db/get-asset-parent?`,
        new HttpParams().set('serialNumberCustomer', encodeURIComponent(serialNumberCustomer)),
      )
      .pipe(map((asset: AssetResponse) => asset.data));
  }
}
