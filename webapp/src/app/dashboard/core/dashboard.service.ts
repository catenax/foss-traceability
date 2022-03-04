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
import { map } from 'rxjs/operators';
import { Dashboard, DashboardFilter } from '../model/dashboard.model';
import { AssetsPerPlant } from '../model/assets-per-plant.model';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AssetFilter } from 'src/app/assets/model/asset-filter.model';
import { AssetsList } from 'src/app/assets/model/assets-list.model';
import { HttpParams } from '@angular/common/http';
import { AffectedPart } from '../model/affected-parts.model';
import { RemainingAlerts, TopAlerts } from '../model/top-alerts.model';
import { Investigation, InvestigationResponse } from 'src/app/investigations/model/investigation.model';
import { QualityAlertFlow } from 'src/app/quality-alert/model/quality-alert.model';

/**
 *
 *
 * @export
 * @class DashboardService
 */
@Injectable()
export class DashboardService {
  /**
   * MSPID api
   *
   * @private
   * @type {{ laapi: string; aems: string }}
   * @memberof AclService
   */
  private url: { laapi: string; aems: string };

  /**
   * @constructor DashboardService (DI)
   * @param {ApiService} apiService
   * @param {AuthService} authService
   * @memberof DashboardService
   */
  constructor(private apiService: ApiService, private authService: AuthService) {
    this.url = this.authService.getUrl();
  }

  /**
   * Stats request
   *
   * @return {Observable<Dashboard>}
   * @memberof DashboardService
   */
  public getStats(): Observable<Dashboard> {
    return this.apiService
      .post(`${this.url.laapi}kpi/kpi-stats`)
      .pipe(map((payload: { data: Dashboard; status: number }) => payload.data));
  }

  /**
   * Assets per plant request
   *
   * @param {DashboardFilter} filter
   * @return {Observable<AssetsPerPlant[]>}
   * @memberof DashboardService
   */
  public getAssetsPerCountry(filter: DashboardFilter): Observable<AssetsPerPlant[]> {
    return this.apiService
      .post(this.url.laapi + 'kpi/assets-per-MaC', { filter })
      .pipe(map((payload: { data: AssetsPerPlant[]; status: number }) => payload.data));
  }

  /**
   * Get top alerts or investigations
   *
   * @param {string} top
   * @param {string} eventFlow
   * @return {Observable<{ topAlerts: TopAlerts[]; remainingAlerts: RemainingAlerts }>}
   * @memberof DashboardService
   */
  public getTopAlerts(
    top: string,
    eventFlow: string,
  ): Observable<{ topAlerts: TopAlerts[]; remainingAlerts: RemainingAlerts }> {
    const httpParams = new HttpParams().set('topAlerts', top).set('eventFlow', eventFlow);

    return this.apiService
      .getBy<{ topAlerts: TopAlerts[]; remainingAlerts: RemainingAlerts }>(
        `${this.url.laapi}kpi/alert-summary?`,
        httpParams,
      )
      .pipe(map((data: { topAlerts: TopAlerts[]; remainingAlerts: RemainingAlerts }) => data));
  }

  /**
   * Get assets request
   *
   * @param {AssetFilter} filter
   * @param {string[]} fields
   * @param {*} [pagination=-1]
   * @return {Observable<AssetsList>}
   * @memberof DashboardService
   */
  public getAssets(filter: AssetFilter, fields: string[], pagination = -1): Observable<AssetsList> {
    return this.apiService.post<AssetsList>(`${this.url.laapi}off-hlf-db/get-asset-list`, {
      filter,
      pagination,
      fields,
    });
  }

  /**
   * Get affected parts by category
   *
   * @param {string} startDate
   * @param {string} endDate
   * @return {Observable<AffectedPart[]>}
   * @memberof DashboardService
   */
  public getAffectedParts(startDate: string, endDate: string): Observable<AffectedPart[]> {
    return this.apiService
      .getBy<AffectedPart[]>(
        `${this.url.laapi}kpi/affected-parts?`,
        new HttpParams().set('startDate', startDate).set('endDate', endDate),
      )
      .pipe(map((affectedParts: AffectedPart[]) => affectedParts));
  }

  /**
   * Parts with quality investigations
   *
   * @return {Observable<Investigation[]>}
   * @memberof DashboardService
   */
  public getPartsWithQualityInvestigations(): Observable<Investigation[]> {
    return this.apiService
      .get<InvestigationResponse>(`${this.url.aems}quality-alert/`)
      .pipe(
        map(investigation =>
          investigation.data.filter(
            flow =>
              flow.alertFlow === QualityAlertFlow.TOP_DOWN &&
              flow.status !== 'canceled' &&
              flow.status !== 'distributed',
          ),
        ),
      );
  }
}
