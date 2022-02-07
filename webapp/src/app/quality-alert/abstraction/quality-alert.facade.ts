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

import { flatten } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { filter, remove } from 'lodash-es';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { realm } from 'src/app/core/api/api.service.properties';
import { Investigation } from 'src/app/investigations/model/investigation.model';
import { SpinnerOverlayService } from 'src/app/layout/presentation/spinner-overlay/core/spinner-overlay.service';
import { LayoutFacade } from 'src/app/shared/abstraction/layout-facade';
import { NotificationService } from 'src/app/shared/components/notifications/notification.service';
import { View } from 'src/app/shared/model/view.model';
import { QualityAlertAssembler } from '../core/quality-alert.assembler';
import { QualityAlertService } from '../core/quality-alert.service';
import { QualityAlertState } from '../core/quality-alert.state';
import { GroupedAlert } from '../model/grouped-alerts.model';
import { QualityAlertChildren, QualityAlertTypes } from '../model/quality-alert.model';

/**
 *
 *
 * @export
 * @class QualityAlertFacade
 */
@Injectable()
export class QualityAlertFacade {
  /**
   * @constructor QualityAlertFacade
   * @param {QualityAlertService} qualityAlertService
   * @param {QualityAlertState} qualityAlertState
   * @param {NotificationService} notificationService
   * @param {LayoutFacade} layoutFacade
   * @param {SpinnerOverlayService} spinnerOverlayService
   * @param {Router} router
   * @memberof QualityAlertFacade
   */
  constructor(
    private qualityAlertService: QualityAlertService,
    private qualityAlertState: QualityAlertState,
    private notificationService: NotificationService,
    private layoutFacade: LayoutFacade,
    private spinnerOverlayService: SpinnerOverlayService,
    private router: Router,
  ) {}

  /**
   * Quality alert state getter
   *
   * @readonly
   * @type {Observable<View<GroupedAlert[]>>}
   * @memberof QualityAlertFacade
   */
  get qualityAlerts$(): Observable<View<GroupedAlert[]>> {
    return this.qualityAlertState.getQualityAlerts$.pipe(delay(0));
  }

  /**
   * Quality alert state snapshot
   *
   * @readonly
   * @type {GroupedAlert[]}
   * @memberof QualityAlertFacade
   */
  get qualityAlertsSnapshot(): GroupedAlert[] {
    return this.qualityAlertState.getQualityAlertsSnapshot;
  }

  /**
   * Single grouped quality alert by alertId getter
   *
   * @readonly
   * @type {Observable<View<GroupedAlert>>}
   * @memberof QualityAlertFacade
   */
  get groupedAlert$(): Observable<GroupedAlert> {
    return this.qualityAlertState.getGroupedAlert$;
  }

  /**
   * Single grouped quality alert by alert id snapshot
   *
   * @readonly
   * @type {View<GroupedAlert>}
   * @memberof QualityAlertFacade
   */
  get groupedAlertSnapshot(): GroupedAlert {
    return this.qualityAlertState.groupedAlertSnapshot;
  }

  /**
   * Error message to be prompted when the searched asset is not available
   *
   * @readonly
   * @type {Observable<boolean>}
   * @memberof QualityAlertFacade
   */
  get updateErrorMessage$(): Observable<boolean> {
    return this.qualityAlertState.getUpdateErrorMessage$;
  }

  /**
   * Is alert ready to delete state getter
   *
   * @readonly
   * @type {Observable<boolean>}
   * @memberof QualityAlertFacade
   */
  get isAlertReadyToDelete$(): Observable<boolean> {
    return this.qualityAlertState.getIsAlertReadyToDelete$;
  }

  /**
   * Quality alert create form getter
   *
   * @readonly
   * @type {FormGroup}
   * @memberof QualityAlertFacade
   */
  get getQualityAlertCreateForm(): FormGroup {
    return this.qualityAlertState.qualityAlertCreateForm;
  }

  /**
   * Quality alert update form
   *
   * @readonly
   * @type {FormGroup}
   * @memberof QualityAlertFacade
   */
  get getQualityAlertUpdateForm(): FormGroup {
    return this.qualityAlertState.qualityAlertUpdateForm;
  }

  /**
   * Quality alert type form
   *
   * @readonly
   * @type {FormGroup}
   * @memberof QualityAlertFacade
   */
  get getQualityAlertTypeForm(): FormGroup {
    return this.qualityAlertState.qualityAlertTypeForm;
  }

  /**
   * Create quality alert request
   * For every new quality alert the notification counter and the list of queued alerts are updated
   *
   * @param {string} qualityType
   * @param {boolean} qualityAlert
   * @param {string[]} serialNumberCustomerList
   * @param {string} description
   * @param {string} alertFlow
   * @param {string} page
   * @return {void}
   * @memberof QualityAlertFacade
   */
  public createQualityAlert(
    qualityType: string,
    qualityAlert: boolean,
    serialNumberCustomerList: string[],
    description?: string,
    alertFlow?: string,
    page?: string,
  ): void {
    this.qualityAlertService
      .createQualityAlert(qualityType, qualityAlert, serialNumberCustomerList, description, alertFlow)
      .subscribe(
        () => {
          const numberOfSerials: string = serialNumberCustomerList.length === 1 ? 'part' : 'parts';
          this.notificationService.success(
            `You've added ${serialNumberCustomerList.length} ${numberOfSerials} in status change queue.`,
          );

          if (page && page === 'investigations') {
            this.qualityAlertState.setIsAlertReadyToDelete(true);
          }

          alertFlow === 'TOP-DOWN'
            ? this.layoutFacade.addQueuedQualityInvestigations(serialNumberCustomerList.length)
            : this.layoutFacade.addQueuedQualityAlerts(serialNumberCustomerList.length);

          this.layoutFacade.setIsFooterDisplayed(true);
        },
        error => this.notificationService.error(error),
      );
  }

  /**
   * Update quality alert request
   *
   * @param {string} alertId
   * @param {string} qualityType
   * @param {string[]} serialNumberCustomerList
   * @param {string} type
   * @param {QualityAlertChildren[]} children
   * @return {void}
   * @memberof QualityAlertFacade
   */
  public updateQualityAlert(
    alertId: string,
    qualityType: string,
    serialNumberCustomerList: string[],
    type: string,
    children?: QualityAlertChildren[],
  ): void {
    this.spinnerOverlayService.setOverlay(true);
    this.qualityAlertService.updateQualityAlert(alertId, qualityType, serialNumberCustomerList).subscribe(
      () => {
        this.notificationService.success(`Quality alert updated`);
        this.qualityAlertState.updateAlert(qualityType, children);
        if (type === 'Queued') {
          this.layoutFacade.resetQueuedQualityAlerts();
          this.layoutFacade.addQueuedQualityAlerts(serialNumberCustomerList.length);
        }
        this.spinnerOverlayService.setOverlay(false);
      },
      error => this.notificationService.error(error),
    );
  }

  /**
   * Queued quality alert state setter
   *
   * @return {void}
   * @memberof QualityAlertFacade
   */
  public setQualityAlerts(): void {
    this.qualityAlertState.setQualityAlerts({ loader: true });
    this.qualityAlertService.getQualityAlerts().subscribe(
      (qualityAlerts: Investigation[]) => {
        this.qualityAlertState.setQualityAlerts({ data: qualityAlerts });
        // This lines below were added in case of commit/delete error. To rebuild the notification counter
        const queuedAlerts = flatten(
          qualityAlerts.filter(alert => alert.status === QualityAlertTypes.PENDING).map(parts => parts.partsAffected),
        );

        this.layoutFacade.setQueuedQualityAlerts(
          queuedAlerts.filter(pendingAlert => pendingAlert.status === QualityAlertTypes.PENDING).length,
        );

        const receivedAlerts = flatten(
          qualityAlerts.filter(alert => alert.status === QualityAlertTypes.CREATED).map(parts => parts.partsAffected),
        );

        this.layoutFacade.setReceivedQualityAlerts(
          receivedAlerts.filter(pendingAlertParts => pendingAlertParts.status === QualityAlertTypes.PENDING).length,
        );
      },
      error => this.qualityAlertState.setQualityAlerts({ error }),
    );
  }

  /**
   * Quality alert list
   *
   * @return {Observable<GroupedAlert[]>}
   * @memberof QualityAlertFacade
   */
  public getQualityAlerts(): Observable<GroupedAlert[]> {
    return this.qualityAlertService.getQualityAlerts().pipe(
      map((alerts: Investigation[]) => {
        this.qualityAlertState.setQualityAlerts({ data: alerts });
        return QualityAlertAssembler.assembleQualityAlerts(alerts);
      }),
    );
  }

  /**
   * View error message setter
   *
   * @param {boolean} hasErrorMessage
   * @return {void}
   * @memberof QualityAlertFacade
   */
  public setUpdateErrorMessage(hasErrorMessage: boolean): void {
    this.qualityAlertState.setUpdateErrorMessage(hasErrorMessage);
  }

  /**
   * Get quality alert by id
   *
   * @param {string} alertId
   * @return {void}
   * @memberof QualityAlertFacade
   */
  public getQualityAlert(alertId: string): void {
    return this.qualityAlertState.setQualityAlert(alertId);
  }

  /**
   * Commit quality alerts request
   * At the time of commit, we must remove the grouped alert from the state list and update the notification counter
   * In case of error we revert the changes by calling the api to update the state
   *
   * @param {string} view
   * @param {string[]} listOfAlerts
   * @return {void}
   * @memberof QualityAlertFacade
   */
  public commitQualityAlerts(view: string, listOfAlerts: string[]): void {
    const url = this.router.url;

    if (url.includes(listOfAlerts.toString())) {
      this.spinnerOverlayService.setOverlay(true);
    } else {
      this.notificationService.info('Your request is being processed in the background', 5000);
    }

    this.updateQualityAlertsCounter(view, listOfAlerts);
    const tabIndex = this.getTab(view);

    this.qualityAlertState.removeAlerts(listOfAlerts);
    this.layoutFacade.setTabIndex(tabIndex);

    this.qualityAlertService.commitQualityAlert(listOfAlerts).subscribe(
      () => {
        this.qualityAlertState.updateStatus();
        this.spinnerOverlayService.setOverlay(false);
        this.notificationService.success('Quality status change distributed. See it on the "Distributed" tab', 5000);
        if (!url.includes(listOfAlerts.toString())) {
          this.setQualityAlerts();
        }
      },
      err => {
        if (err) {
          this.spinnerOverlayService.setOverlay(false);
          this.setQualityAlerts();
        }
      },
    );
  }

  /**
   * Delete quality alerts request
   * At the time of delete, we must remove the grouped alert from the state list and update the notification counter
   * In case of error we revert the changes by calling the api to update the state
   *
   * @param {string} view
   * @param {string[]} listOfAlerts
   * @return {void}
   * @memberof QualityAlertFacade
   */
  public discardQualityAlerts(view: string, listOfAlerts: string[]): void {
    this.notificationService.info('Your request is being processed in the background', 5000);
    this.updateQualityAlertsCounter(view, listOfAlerts);
    const tabIndex = this.getTab(view);

    this.qualityAlertState.removeAlerts(listOfAlerts);
    this.layoutFacade.setTabIndex(tabIndex);

    this.qualityAlertService.deleteQualityAlerts(listOfAlerts).subscribe(
      () => {
        if (this.router.url.includes(listOfAlerts.toString())) {
          this.router.navigate([`${realm[1]}/quality-alert`]).then();
        }
        this.notificationService.success('Quality status change discarded', 5000);
      },
      error => {
        if (error) {
          this.setQualityAlerts();
        }
      },
    );
  }

  /**
   * Update the notification counter in case of update and delete quality alerts
   *
   * @private
   * @param {string} view
   * @param {string[]} listOfAlerts
   * @return {void}
   * @memberof QualityAlertFacade
   */
  private updateQualityAlertsCounter(view: string, listOfAlerts?: string[]): void {
    if (listOfAlerts.length > 1) {
      view === 'queued' ? this.layoutFacade.resetQueuedQualityAlerts() : this.layoutFacade.resetReceivedQualityAlerts();
    } else {
      const alerts: GroupedAlert[] =
        view === 'queued'
          ? this.qualityAlertsSnapshot.filter(
              qualityAlert =>
                qualityAlert.status === QualityAlertTypes.PENDING &&
                remove(qualityAlert.children, part => part.status !== QualityAlertTypes.PENDING),
            )
          : this.qualityAlertsSnapshot.filter(
              alert =>
                alert.status === QualityAlertTypes.CREATED &&
                remove(alert.children, external => external.status !== QualityAlertTypes.PENDING),
            );
      const filteredAlerts = filter(alerts, alert => !listOfAlerts.includes(alert.alertId));
      const numberOfAlerts: number = filteredAlerts
        .map(alert => alert.numberOfParts)
        .reduce((acc, value) => acc + value, 0);

      view === 'queued'
        ? this.layoutFacade.setQueuedQualityAlerts(numberOfAlerts)
        : this.layoutFacade.setReceivedQualityAlerts(numberOfAlerts);
    }
  }

  /**
   * Gets the correct tab index of the quality alert page
   *
   * @private
   * @param {string} view
   * @return {number}
   * @memberof QualityAlertFacade
   */
  private getTab(view: string): number {
    return view === 'queued' ? 1 : 0;
  }
}
