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
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AssetFilter } from 'src/app/assets/model/asset-filter.model';
import { AssetsList } from 'src/app/assets/model/assets-list.model';
import { ApiService } from 'src/app/core/api/api.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Asset } from 'src/app/shared/model/asset.model';
import { Investigation, InvestigationResponse } from '../model/investigation.model';

/**
 *
 *
 * @export
 * @class InvestigationsService
 */
@Injectable()
export class InvestigationsService {
  /**
   * Api url tag before request
   *
   * @private
   * @type {string}
   * @memberof InvestigationsService
   */
  private urlTag = 'quality-alert';

  /**
   * Api url
   *
   * @private
   * @type {{ laapi: string; aems: string }}
   * @memberof InvestigationsService
   */
  private url: { laapi: string; aems: string };

  /**
   * @constructor InvestigationsService (DI)
   * @param {ApiService} apiService
   * @param {AuthService} authService
   * @memberof InvestigationsService
   */
  constructor(private apiService: ApiService, private authService: AuthService) {
    this.url = this.authService.getUrl();
  }

  /**
   * Get all investigations request
   *
   * @return {Observable<Investigation>}
   * @memberof InvestigationsService
   */
  public getInvestigations(): Observable<Investigation[]> {
    return this.apiService
      .get<InvestigationResponse>(`${this.url.aems}${this.urlTag}/`)
      .pipe(map(investigation => investigation.data.filter(flow => flow.alertFlow === 'TOP-DOWN')));
  }

  /**
   * Get parts to investigate
   *
   * @param {AssetFilter} filter
   * @param {*} [pagination=-1]
   * @param {string[]} fields
   * @return {Observable<Asset[]>}
   * @memberof InvestigationsService
   */
  public getParts(filter: AssetFilter, fields: string[], pagination = -1): Observable<Asset[]> {
    return this.apiService
      .post<AssetsList>(`${this.url.laapi}off-hlf-db/get-asset-list`, {
        filter,
        pagination,
        fields,
      })
      .pipe(map(asset => asset.data));
  }
}
