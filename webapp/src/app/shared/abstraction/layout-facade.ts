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
import { filter, flatten, remove, map as lodashMap } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Acl } from 'src/app/acl/model/acl.model';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Realm } from 'src/app/core/model/realm.model';
import { UserService } from 'src/app/core/user/user.service';
import { Investigation } from 'src/app/investigations/model/investigation.model';
import { QualityAlertFlow, QualityAlertTypes } from 'src/app/quality-alert/model/quality-alert.model';
import { LayoutState } from '../core/layout.state';
import { SharedService } from '../core/shared.service';
import { Mspid } from '../model/mspid.model';

/**
 *
 *
 * @export
 * @class LayoutFacade
 */
@Injectable({
  providedIn: 'root',
})
export class LayoutFacade {
  /**
   * @constructor LayoutFacade (DI)
   * @param {LayoutState} layoutState
   * @param {UserService} userService
   * @param {AuthService} authService
   * @param {SharedService} sharedService
   * @memberof LayoutFacade
   */
  constructor(
    private layoutState: LayoutState,
    private userService: UserService,
    private authService: AuthService,
    private sharedService: SharedService,
  ) {}

  /**
   * Acl badge state getter
   *
   * @readonly
   * @type {Observable<number>}
   * @memberof LayoutFacade
   */
  get aclBadge$(): Observable<number> {
    return this.layoutState.getAclBadge$;
  }

  /**
   * User information getter
   *
   * @readonly
   * @type {{ name: string; email: string; role: string }}
   * @memberof LayoutFacade
   */
  get getUserInformation(): { name: string; email: string; role: string } {
    return {
      name: `${this.userService.getFirstname()} ${this.userService.getSurname()}`,
      email: `${this.userService.getEmail()}`,
      role: `${this.userService.getRoles().join(', ')}`,
    };
  }

  /**
   * Organization preferences
   *
   * @readonly
   * @type {Realm}
   * @memberof LayoutFacade
   */
  get getOrgPreferences(): Realm {
    return this.userService.getOrgPreferences();
  }

  /**
   * Icon name getter
   *
   * @readonly
   * @type {string}
   * @memberof LayoutFacade
   */
  get realmName(): string {
    return this.userService.getFirstname();
  }

  /**
   * Icon name getter
   *
   * @readonly
   * @type {string}
   * @memberof LayoutFacade
   */
  get mspid(): string {
    return this.userService.getMspid();
  }

  /**
   * Mspids state getter
   *
   * @readonly
   * @type {Observable<Mspid[]>}
   * @memberof LayoutFacade
   */
  get mspids(): Observable<Mspid[]> {
    return this.layoutState.getMspids$;
  }

  /**
   * Mpsids snapshot
   *
   * @readonly
   * @type {Mspid[]}
   * @memberof LayoutFacade
   */
  get mspidsSnapshot(): Mspid[] {
    return this.layoutState.mspIdsSnapshot;
  }

  /**
   * Custom breadcrumb getter
   *
   * @readonly
   * @type {string}
   * @memberof LayoutFacade
   */
  get breadcrumbLabel(): string {
    return this.layoutState.getBreadCrumbLabel;
  }

  /**
   * Tab index state getter
   *
   * @readonly
   * @type {Observable<number>}
   * @memberof LayoutFacade
   */
  get tabIndex$(): Observable<number> {
    return this.layoutState.getTabIndex$;
  }

  /**
   *Tab index state snapshot
   *
   * @readonly
   * @type {number}
   * @memberof LayoutFacade
   */
  get tabIndexSnapshot(): number {
    return this.layoutState.getTabIndexSnapshot;
  }

  /**
   * Queued quality alert count state
   *
   * @readonly
   * @type {Observable<number>}
   * @memberof LayoutFacade
   */
  get queuedQualityAlerts$(): Observable<number> {
    return this.layoutState.getQueuedQualityAlerts$;
  }

  /**
   * Queued quality investigations count state
   *
   * @readonly
   * @type {Observable<number>}
   * @memberof LayoutFacade
   */
  get queuedQualityInvestigations$(): Observable<number> {
    return this.layoutState.getQueuedQualityInvestigationsCounter$;
  }

  /**
   * Received quality alert count state
   *
   * @readonly
   * @type {Observable<number>}
   * @memberof LayoutFacade
   */
  get receivedQualityAlerts$(): Observable<number> {
    return this.layoutState.getReceivedQualityAlertsCounter$;
  }

  /**
   * Received quality investigations badge
   *
   * @readonly
   * @type {Observable<number>}
   * @memberof LayoutFacade
   */
  get receivedQualityInvestigations$(): Observable<number> {
    return this.layoutState.getQualityInvestigationBadge$;
  }

  /**
   * Is sidebar expanded state
   *
   * @readonly
   * @type {Observable<boolean>}
   * @memberof LayoutFacade
   */
  get isSideBarExpanded$(): Observable<boolean> {
    return this.layoutState.getIsSideBarExpanded$;
  }

  /**
   * Is footer displayed flag
   *
   * @readonly
   * @type {Observable<boolean>}
   * @memberof LayoutFacade
   */
  get isFooterDisplayed$(): Observable<boolean> {
    return this.layoutState.getIsFooterDisplayed$;
  }

  /**
   * Organizations state getter
   *
   * @readonly
   * @type {Observable<string[]>}
   * @memberof LayoutFacade
   */
  get organizations$(): Observable<string[]> {
    return this.layoutState.getOrganizations$;
  }

  /**
   * Organizations state snapshot
   *
   * @readonly
   * @type {string[]}
   * @memberof LayoutFacade
   */
  get organizationsSnapshot(): string[] {
    return this.layoutState.organizationsSnapshot;
  }

  /**
   *
   * Logout request
   *
   * @return {void}
   * @memberof LayoutFacade
   */
  public logOut(): void {
    this.authService.logOut();
  }

  /**
   * Is empty helper method
   *
   * @param {unknown} object
   * @return {boolean}
   * @memberof LayoutFacade
   */
  public isEmpty(object: unknown): boolean {
    return this.sharedService.isEmpty(object);
  }

  /**
   * Acl badge state setter
   *
   * @param {number} aclCounter
   * @return {void}
   * @memberof LayoutFacade
   */
  public setAclBadge(aclCounter: number): void {
    this.layoutState.setAclBadge(aclCounter);
  }

  /**
   * Acls counter request
   *
   * @return {void}
   * @memberof LayoutFacade
   */
  public setAclsCounter(): void {
    this.layoutState.resetAclBadge();
    this.sharedService.getACL().subscribe((acls: Acl[]) => {
      this.setAclBadge(acls.length);
    });
  }

  /**
   * Alert counter setter
   *
   * @return {void}
   * @memberof LayoutFacade
   */
  public setAlerts(): void {
    this.sharedService.getAlerts().subscribe((investigations: Investigation[]) => {
      this.setQueuedAlerts(investigations);
      this.setReceivedAlerts(investigations);
    });
  }

  /**
   * Set mspids request
   *
   * @return {void}
   * @memberof LayoutFacade
   */
  public setMspids(): void {
    this.sharedService.getMspids().subscribe((mspidsValues: string[]) => {
      const mspids: Mspid[] = [];
      const colorPalette = ['#e83e8c', '#03a9f4', '#6610f2', '#fe6702', '#20c997'];
      let index = 0;

      mspidsValues.forEach(value => {
        mspids.push({ name: value, color: colorPalette[index] });
        index++;
      });
      this.layoutState.setMspids(mspids);
    });
  }

  /**
   * Mspid request for the resolver route
   *
   * @return {Observable<Mspid[]>}
   * @memberof LayoutFacade
   */
  public getMspidRequest(): Observable<Mspid[]> {
    return this.sharedService.getMspids().pipe(
      map((mspidsValues: string[]) => {
        const mspids: Mspid[] = [];
        const colorPalette = ['#e83e8c', '#03a9f4', '#6610f2', '#fe6702', '#20c997'];
        let index = 0;

        mspidsValues.forEach(value => {
          mspids.push({ name: value, color: colorPalette[index] });
          index++;
        });
        return mspids;
      }),
    );
  }

  /**
   * Organization state setter
   *
   * @return {void}
   * @memberof LayoutFacade
   */
  public setOrganizations(): void {
    this.sharedService.getAllOrganizations().subscribe((organizations: string[]) => {
      this.layoutState.setOrganizations(organizations);
    });
  }

  /**
   * Acls badge state reset
   *
   * @return {void}
   * @memberof LayoutFacade
   */
  public resetAclBadge(): void {
    this.layoutState.resetAclBadge();
  }

  /**
   * Tab index state setter
   *
   * @param {number} index
   * @return {void}
   * @memberof LayoutFacade
   */
  public setTabIndex(index: number): void {
    this.layoutState.setTabIndex(index);
  }

  /**
   * Adds quality investigations to counter
   *
   * @param {number} investigations
   * @return {void}
   * @memberof LayoutFacade
   */
  public addQueuedQualityInvestigations(investigations: number): void {
    this.layoutState.addQueuedQualityInvestigations(investigations);
  }

  /**
   * Quality investigations setter
   *
   * @param {number} investigations
   * @return {void}
   * @memberof LayoutFacade
   */
  public setQueuedQualityInvestigations(investigations: number): void {
    this.layoutState.setQueuedQualityInvestigations(investigations);
  }

  /**
   * Reset quality investigations counter state
   *
   * @return {void}
   * @memberof LayoutFacade
   */
  public resetQueuedQualityInvestigations(): void {
    this.layoutState.resetQualityInvestigationsCounter();
  }

  /**
   * Add quality alerts to counter
   *
   * @param {number} alerts
   * @return {void}
   * @memberof LayoutFacade
   */
  public addQueuedQualityAlerts(alerts: number): void {
    this.layoutState.addQueuedQualityAlerts(alerts);
  }

  /**
   * Quality alerts setter
   *
   * @param {number} alerts
   * @return {void}
   * @memberof LayoutFacade
   */
  public setQueuedQualityAlerts(alerts: number): void {
    this.layoutState.setQueuedQualityAlerts(alerts);
  }

  /**
   * Reset quality alert counter state
   *
   * @return {void}
   * @memberof LayoutFacade
   */
  public resetQueuedQualityAlerts(): void {
    this.layoutState.resetQueuedQualityAlerts();
  }

  /**
   * Add quality alerts to counter
   *
   * @param {number} alerts
   * @return {void}
   * @memberof LayoutFacade
   */
  public addReceivedQualityAlerts(alerts: number): void {
    this.layoutState.addReceivedQualityAlerts(alerts);
  }

  /**
   * Quality alerts setter
   *
   * @param {number} alerts
   * @return {void}
   * @memberof LayoutFacade
   */
  public setReceivedQualityAlerts(alerts: number): void {
    this.layoutState.setReceivedQualityAlerts(alerts);
  }

  /**
   * Reset quality alert counter state
   *
   * @return {void}
   * @memberof LayoutFacade
   */
  public resetReceivedQualityAlerts(): void {
    this.layoutState.resetReceivedQualityAlerts();
  }

  /**
   * Add quality alerts to counter
   *
   * @param {number} alerts
   * @return {void}
   * @memberof LayoutFacade
   */
  public addReceivedQualityInvestigations(alerts: number): void {
    this.layoutState.addQualityInvestigationToBadge(alerts);
  }

  /**
   * Quality alerts setter
   *
   * @param {number} alerts
   * @return {void}
   * @memberof LayoutFacade
   */
  public setReceivedQualityInvestigationsCounter(alerts: number): void {
    this.layoutState.setQualityInvestigationBadge(alerts);
  }

  /**
   * Reset quality alert counter state
   *
   * @return {void}
   * @memberof LayoutFacade
   */
  public resetReceivedQualityInvestigations(): void {
    this.layoutState.resetQualityInvestigationBadge();
  }

  /**
   * Is sidebar expanded setter
   *
   * @param {boolean} isExpanded
   * @return {void}
   * @memberof LayoutFacade
   */
  public setIsSideBarExpanded(isExpanded: boolean): void {
    this.layoutState.setIsSideBarExpanded(isExpanded);
  }

  /**
   * Is footer displayed setter
   *
   * @param {boolean} isDisplayed
   * @return {void}
   * @memberof LayoutFacade
   */
  public setIsFooterDisplayed(isDisplayed: boolean): void {
    this.layoutState.setIsFooterDisplayed(isDisplayed);
  }

  /**
   * Can deactivate state setter
   *
   * @param {boolean} canDeactivate
   * @return {void}
   * @memberof LayoutFacade
   */
  public setCanDeactivate(canDeactivate: boolean): void {
    this.layoutState.setCanDeactivate(canDeactivate);
  }

  /**
   * Set queued alerts
   *
   * @private
   * @param {Investigation[]} investigations
   * @return {void}
   * @memberof LayoutFacade
   */
  private setQueuedAlerts(investigations: Investigation[]): void {
    this.resetQueuedQualityAlerts();
    this.resetQueuedQualityInvestigations();
    const queuedAlerts: number = lodashMap(
      [
        ...filter(
          investigations,
          flow => flow.alertFlow === QualityAlertFlow.BOTTOM_UP && flow.status === QualityAlertTypes.PENDING,
        ),
      ],
      queuedAlert => remove(queuedAlert.partsAffected, part => part.status !== QualityAlertTypes.PENDING),
    ).length;

    const queuedInvestigations: number = flatten(
      lodashMap(
        [
          ...filter(
            investigations,
            queuedInvestigation =>
              queuedInvestigation.alertFlow === QualityAlertFlow.TOP_DOWN &&
              queuedInvestigation.status === QualityAlertTypes.PENDING,
          ),
        ],
        investigation => investigation.partsAffected,
      ),
    ).length;

    if ((queuedAlerts && queuedAlerts !== 0) || (queuedInvestigations && queuedInvestigations !== 0)) {
      this.setIsFooterDisplayed(true);
    }

    this.setQueuedQualityAlerts(queuedAlerts);
    this.setQueuedQualityInvestigations(queuedInvestigations);
  }

  /**
   * Set received alerts
   *
   * @private
   * @param {Investigation[]} investigations
   * @memberof LayoutFacade
   */
  private setReceivedAlerts(investigations: Investigation[]): void {
    this.resetReceivedQualityAlerts();
    this.resetReceivedQualityInvestigations();

    const receivedAlerts: number = flatten(
      lodashMap(
        [
          ...filter(
            investigations,
            alert => alert.alertFlow === QualityAlertFlow.BOTTOM_UP && alert.status === QualityAlertTypes.CREATED,
          ),
        ],
        receivedAlert => [...filter(receivedAlert.partsAffected, part => part.status === QualityAlertTypes.PENDING)],
      ),
    ).length;

    const receivedInvestigations: number = flatten(
      lodashMap(
        [
          ...filter(
            investigations,
            investigation =>
              investigation.alertFlow === QualityAlertFlow.TOP_DOWN &&
              investigation.status === QualityAlertTypes.EXTERNAL,
          ),
        ],
        receivedInvestigation => [
          ...lodashMap(receivedInvestigation.partsAffected, part => part.status !== 'canceled'),
        ],
      ),
    ).length;

    this.setReceivedQualityAlerts(receivedAlerts);
    this.setReceivedQualityInvestigationsCounter(receivedInvestigations);
  }
}
