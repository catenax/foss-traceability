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

import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/core/api/api.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Investigation, InvestigationResponse } from 'src/app/investigations/model/investigation.model';
import { CommittedAlert } from '../model/committed-alert.model';
import { CreatedAlert } from '../model/created-alert.model';
import { QualityAlert, QualityAlertFlow } from '../model/quality-alert.model';

/**
 *
 *
 * @export
 * @class QualityAlertService
 */
@Injectable({
  providedIn: 'root',
})
export class QualityAlertService {
  /**
   * MSPID api
   *
   * @private
   * @type {{ laapi: string; aems: string }}
   * @memberof AclService
   */
  private url: { laapi: string; aems: string };

  /**
   * @constructor QualityAlertService
   * @param {ApiService} apiService
   * @param {AuthService} authService
   * @memberof QualityAlertService
   */
  constructor(private apiService: ApiService, private authService: AuthService) {
    this.url = this.authService.getUrl();
  }

  /**
   * Quality alert create request
   *
   * @param {string} qualityType
   * @param {boolean} qualityAlert
   * @param {string[]} serialNumberCustomerList
   * @param {string} description
   * @param {string} alertFlow
   * @return {Observable<CreatedAlert>}
   * @memberof QualityAlertService
   */
  public createQualityAlert(
    qualityType: string,
    qualityAlert: boolean,
    serialNumberCustomerList: string[],
    description?: string,
    alertFlow?: string,
  ): Observable<CreatedAlert> {
    return this.apiService.post<CreatedAlert>(`${this.url.aems}quality-alert/create`, {
      qualityType,
      qualityAlert,
      serialNumberCustomerList,
      message: description,
      alertFlow,
    });
  }

  /**
   * Quality alert update request
   *
   * @param {string} alertID
   * @param {string} qualityType
   * @param {string[]} serialNumberCustomerList
   * @param {boolean} [qualityAlert=true]
   * @return {*}  {Observable<{
   *     alertID: string;
   *     qualityType: string;
   *     qualityStatus: string;
   *     serialNumberCustomersAdded: number;
   *     serialNumberCustomersFailed: number;
   *     serialNumberCustomersUpdated: number;
   *     serialNumberCustomersDeleted: number;
   *   }>}
   * @memberof QualityAlertService
   */
  public updateQualityAlert(
    alertID: string,
    qualityType: string,
    serialNumberCustomerList: string[],
    qualityAlert = true,
  ): Observable<{
    alertID: string;
    qualityType: string;
    qualityStatus: string;
    serialNumberCustomersAdded: number;
    serialNumberCustomersFailed: number;
    serialNumberCustomersUpdated: number;
    serialNumberCustomersDeleted: number;
  }> {
    return this.apiService.post<{
      alertID: string;
      qualityType: string;
      qualityStatus: string;
      serialNumberCustomersAdded: number;
      serialNumberCustomersFailed: number;
      serialNumberCustomersUpdated: number;
      serialNumberCustomersDeleted: number;
    }>(`${this.url.aems}quality-alert/update`, { alertID, qualityType, serialNumberCustomerList, qualityAlert });
  }

  /**
   * Quality alert commit request
   *
   * @param {string[]} alertIDs
   * @return {Observable<CommittedAlert>}
   * @memberof QualityAlertService
   */
  public commitQualityAlert(alertIDs: string[]): Observable<CommittedAlert> {
    return this.apiService.post<CommittedAlert>(`${this.url.aems}quality-alert/commit`, { alertIDs });
  }

  /**
   * Quality alert delete request
   *
   * @param {string[]} alertIDs
   * @return {Observable<{ eventsDeleted: number; alertsDeleted: number }>}
   * @memberof QualityAlertService
   */
  public deleteQualityAlerts(alertIDs: string[]): Observable<{ eventsDeleted: number; alertsDeleted: number }> {
    return this.apiService.put<{ eventsDeleted: number; alertsDeleted: number }>(
      `${this.url.aems}quality-alert/alerts`,
      { alertIDs },
    );
  }

  /**
   * Get all quality alerts
   *
   * @return {Observable<Investigation[]>}
   * @memberof QualityAlertService
   */
  public getQualityAlerts(): Observable<Investigation[]> {
    return this.apiService
      .get<InvestigationResponse>(`${this.url.aems}quality-alert/`)
      .pipe(map(investigation => investigation.data.filter(flow => flow.alertFlow === QualityAlertFlow.BOTTOM_UP)));
  }

  /**
   * Quality alert by id request
   *
   * @param {string} alertId
   * @return {Observable<QualityAlert[]>}
   * @memberof QualityAlertService
   */
  public getQualityAlertById(alertId: string): Observable<QualityAlert[]> {
    return this.apiService
      .getBy(`${this.url.aems}quality-alert/alertid?`, new HttpParams().set('alertID', encodeURIComponent(alertId)))
      .pipe(map((value: { data: QualityAlert[] }) => value.data.filter(alert => alert.status === 'pending')));
  }
}
