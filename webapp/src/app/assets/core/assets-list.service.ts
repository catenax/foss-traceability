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
import { ApiService } from '../../core/api/api.service';
import { share, timeout } from 'rxjs/operators';
import { AssetFilter } from '../model/asset-filter.model';
import { Observable } from 'rxjs';
import { AssetsList } from '../model/assets-list.model';
import { ExportResponse } from '../model/export.model';
import { AuthService } from 'src/app/core/auth/auth.service';

/**
 *
 *
 * @export
 * @class AssetsListService
 */
@Injectable({
  providedIn: 'root',
})
export class AssetsListService {
  /**
   * MSPID api
   *
   * @private
   * @type {{ laapi: string; aems: string }}
   * @memberof AclService
   */
  private url: { laapi: string; aems: string };

  /**
   * @constructor AssetsListService DI.
   * @param {ApiService} apiService
   * @param {AuthService} authService
   * @memberof AssetsListService
   */
  constructor(private apiService: ApiService, private authService: AuthService) {
    this.url = this.authService.getUrl();
  }
  /**
   * Get all assets request
   *
   * @param {AssetFilter} filter
   * @param {number} pagination
   * @param {string[]} fields
   * @return {Observable<AssetsList>}
   * @memberof AssetsListService
   */
  public getAssets(filter: AssetFilter, pagination: number, fields: string[]): Observable<AssetsList> {
    return this.apiService
      .post<AssetsList>(`${this.url.laapi}off-hlf-db/get-asset-list`, {
        filter,
        pagination,
        fields,
      })
      .pipe(share(), timeout(5 * 60 * 1000));
  }

  /**
   * Export data request
   *
   * @param {AssetFilter} filter
   * @param {string} reportType
   * @return {Observable<ExportResponse>}
   * @memberof AssetsListService
   */
  public exportData(filter: AssetFilter, reportType: string): Observable<ExportResponse> {
    return this.apiService.post<ExportResponse>(`${this.url.laapi}off-hlf-db/get-customs-report`, {
      filter,
      reportType,
    });
  }
}
