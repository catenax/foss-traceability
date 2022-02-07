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
import { ApiService } from '../../core/api/api.service';
import { isEmpty, random } from 'lodash-es';
import { DateTime } from 'luxon';
import { Tiles } from '../model/tiles.model';
import { Acl, ACLResponse } from 'src/app/acl/model/acl.model';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Investigation, InvestigationResponse } from 'src/app/investigations/model/investigation.model';

/**
 *
 *
 * @export
 * @class SharedService
 */
@Injectable({
  providedIn: 'root',
})
export class SharedService {
  /**
   * MSPID api
   *
   * @private
   * @type {{ laapi: string; aems: string }}
   * @memberof AclService
   */
  private url: { laapi: string; aems: string };
  private mspid: string;

  /**
   * @constructor SharedService {DI}
   * @param {ApiService} apiService
   * @memberof SharedService
   */
  constructor(private apiService: ApiService, private authService: AuthService) {
    this.url = this.authService.getUrl();
    this.mspid = this.authService.getMspid();
  }

  /**
   * Set today's date
   *
   * @return {string}
   * @memberof SharedService
   */
  public setTodayDate(): string {
    return DateTime.local().toISODate();
  }

  /**
   * Get the last date from a period of days
   *
   * @param {number} amountOfDays
   * @return {string}
   * @memberof SharedService
   */
  public getPastDays(amountOfDays: number): string {
    return DateTime.local()
      .minus({ days: amountOfDays })
      .toISODate();
  }

  /**
   * Formatted date with time
   *
   * @param {(Date | string)} date
   * @return {string}
   * @memberof SharedService
   */
  public formatDate(date: Date | string): string {
    return typeof date === 'string'
      ? DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
      : date.toLocaleString();
  }

  /**
   * Timestamp to date
   *
   * @param {number} timestamp
   * @return {Date}
   * @memberof SharedService
   */
  public timestampToDate(timestamp: number): Date {
    return DateTime.fromMillis(timestamp);
  }

  /**
   * Local date to timestamp
   *
   * @return {string}
   * @memberof SharedService
   */
  public dateToTimestamp(): string {
    return DateTime.local().toMillis();
  }

  /**
   * Timestamp to UTC date string
   *
   * @param {string} timestamp
   * @return {string}
   * @memberof SharedService
   */
  public timestampToDateString(timestamp: string): string {
    return new Date(+timestamp * 1000).toJSON();
  }

  /**
   * Helper method to uppercase the first letter
   *
   * @param {string} word
   * @return {string}
   * @memberof SharedService
   */
  public firstLetterToUpperCase(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  /**
   * Get tiles request
   *
   * @return {Observable<Tiles>}
   * @memberof SharedService
   */
  public getTiles(): Observable<Tiles> {
    return this.apiService
      .get<{
        data: Tiles;
        status: number;
      }>(`${this.url.laapi}kpi/tiles`)
      .pipe(map((tiles: { data: Tiles; status: number }) => tiles.data));
  }

  /**
   * Get mspids request
   *
   * @return {Observable<string[]>}
   * @memberof SharedService
   */
  public getMspids(): Observable<string[]> {
    return this.apiService
      .get<{ data: string[] }>(`${this.url.laapi}off-hlf-db/get-mspids`)
      .pipe(map((mspid: { data: string[] }) => mspid.data));
  }

  /**
   * Get pending acls request
   *
   * @return {Observable<Acl[]>}
   * @memberof SharedService
   */
  public getACL(): Observable<Acl[]> {
    return this.apiService
      .get<ACLResponse>(`${this.url.aems}access-mgmt/get-access-control-list`)
      .pipe(map(supplier => Object.values(supplier.data.ACL).filter(acl => acl.status === 'PENDING')));
  }

  /**
   * Get quality alert request
   *
   * @return {Observable<Investigation[]>}
   * @memberof SharedService
   */
  public getAlerts(): Observable<Investigation[]> {
    return this.apiService
      .get<InvestigationResponse>(`${this.url.aems}quality-alert/`)
      .pipe(map(investigation => investigation.data));
  }

  /**
   * Get all available organizations
   *
   * @return {Observable<string[]>}
   * @memberof SharedService
   */
  public getAllOrganizations(): Observable<string[]> {
    return this.apiService.get(`${this.url.aems}access-mgmt/all`).pipe(map((orgs: { data: string[] }) => orgs.data));
  }

  /**
   * Helper method to check empty objects
   *
   * @template T
   * @param {T} object
   * @return {boolean}
   * @memberof SharedService
   */
  public isEmpty<T>(object: T): boolean {
    return isEmpty(object);
  }

  /**
   * Generate random string
   *
   * @return {string}
   * @memberof SharedService
   */
  public generateRandomID(): string {
    const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
    return uint32.toString(16);
  }

  /**
   * Random color generator
   *
   * @return {string}
   * @memberof SharedService
   */
  public generateRandomColor(): string {
    const colorPalette = ['#6610f2', '#e83e8c', '#fe6702', '#20c997', '#03a9f4'];
    const randomColors = Math.floor(random(colorPalette.length));
    return colorPalette[randomColors];
  }
}
