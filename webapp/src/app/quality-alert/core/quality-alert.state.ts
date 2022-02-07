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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { State } from 'src/app/shared/model/state';
import { View } from 'src/app/shared/model/view.model';
import { GroupedAlert } from '../model/grouped-alerts.model';
import { QualityAlertChildren } from '../model/quality-alert.model';
import { QualityAlertAssembler } from './quality-alert.assembler';
import { filter, find } from 'lodash-es';
import { Investigation } from 'src/app/investigations/model/investigation.model';

/**
 *
 *
 * @export
 * @class QualityAlertState
 */
@Injectable()
export class QualityAlertState {
  /**
   * Queued quality alert state
   *
   * @private
   * @readonly
   * @type {State<View<GroupedAlert[]>>}
   * @memberof QualityAlertState
   */
  private readonly qualityAlerts$: State<View<GroupedAlert[]>> = new State<View<GroupedAlert[]>>({ loader: true });

  /**
   * Single grouped alert state
   *
   * @private
   * @readonly
   * @type {State<View<GroupedAlert>>}
   * @memberof QualityAlertState
   */
  private readonly groupedAlert$: State<GroupedAlert> = new State<GroupedAlert>(undefined);

  /**
   * Error message state
   *
   * @private
   * @readonly
   * @type {State<boolean>}
   * @memberof QualityAlertState
   */
  private readonly updateErrorMessage$: State<boolean> = new State<boolean>(false);

  /**
   * is alert ready to delete state
   *
   * @private
   * @type {State<boolean>}
   * @memberof QualityAlertState
   */
  private readonly isAlertReadyToDelete$: State<boolean> = new State<boolean>(false);

  /**
   * Queued quality alert state getter
   *
   * @readonly
   * @type {Observable<View<GroupedAlert[]>>}
   * @memberof QualityAlertState
   */
  get getQualityAlerts$(): Observable<View<GroupedAlert[]>> {
    return this.qualityAlerts$.observable;
  }

  /**
   * Quality alert state snapshot
   *
   * @readonly
   * @type {GroupedAlert[]}
   * @memberof QualityAlertState
   */
  get getQualityAlertsSnapshot(): GroupedAlert[] {
    return this.qualityAlerts$.snapshot.data;
  }

  /**
   * Single grouped alert state getter
   *
   * @readonly
   * @type {Observable<View<GroupedAlert>>}
   * @memberof QualityAlertState
   */
  get getGroupedAlert$(): Observable<GroupedAlert> {
    return this.groupedAlert$.observable;
  }

  /**
   * Single grouped alert snapshot getter
   *
   * @readonly
   * @type {View<GroupedAlert>}
   * @memberof QualityAlertState
   */
  get groupedAlertSnapshot(): GroupedAlert {
    return this.groupedAlert$.snapshot;
  }

  /**
   * Error message state getter
   *
   * @readonly
   * @type {Observable<boolean>}
   * @memberof QualityAlertState
   */
  get getUpdateErrorMessage$(): Observable<boolean> {
    return this.updateErrorMessage$.observable;
  }

  /**
   * Is alert ready to delete getter
   *
   * @readonly
   * @type {Observable<boolean>}
   * @memberof QualityAlertState
   */
  get getIsAlertReadyToDelete$(): Observable<boolean> {
    return this.isAlertReadyToDelete$.observable;
  }

  /**
   * Investigations form
   *
   * @readonly
   * @type {FormGroup}
   * @memberof InvestigationsState
   */
  get qualityAlertCreateForm(): FormGroup {
    const builder = new FormBuilder();
    return builder.group({
      type: ['', Validators.required],
      description: [''],
    });
  }

  /**
   * Investigations form
   *
   * @readonly
   * @type {FormGroup}
   * @memberof InvestigationsState
   */
  get qualityAlertUpdateForm(): FormGroup {
    const builder = new FormBuilder();
    return builder.group({
      type: ['', Validators.required],
    });
  }

  /**
   * Quality alert type form
   *
   * @readonly
   * @type {FormGroup}
   * @memberof QualityAlertState
   */
  get qualityAlertTypeForm(): FormGroup {
    const builder = new FormBuilder();
    return builder.group({
      type: ['Queued'],
    });
  }

  /**
   * Queued quality alert state setter
   *
   * @param {View<QualityAlert[]>} qualityAlerts
   * @return {void}
   * @memberof QualityAlertState
   */
  public setQualityAlerts(qualityAlerts: View<Investigation[]>): void {
    const groupedAlerts: View<GroupedAlert[]> = {
      data: qualityAlerts.data && QualityAlertAssembler.assembleQualityAlerts(qualityAlerts.data),
      loader: qualityAlerts.loader,
      error: qualityAlerts.error,
    };

    this.qualityAlerts$.update(groupedAlerts);
  }

  /**
   * Grouped alert reset
   *
   * @return {void}
   * @memberof QualityAlertState
   */
  public resetGroupedAlert(): void {
    this.groupedAlert$.reset();
  }

  /**
   * Error message state setter
   *
   * @param {boolean} hasErrorMessage
   * @return {void}
   * @memberof QualityAlertState
   */
  public setUpdateErrorMessage(hasErrorMessage: boolean): void {
    this.updateErrorMessage$.update(hasErrorMessage);
  }

  /**
   * Is alert ready to delete state setter
   *
   * @param {boolean} isAlertReadyToDelete
   * @return {void}
   * @memberof QualityAlertState
   */
  public setIsAlertReadyToDelete(isAlertReadyToDelete: boolean): void {
    this.isAlertReadyToDelete$.update(isAlertReadyToDelete);
  }

  /**
   * Groupe quality alert setter
   *
   * @param {string} alertId
   * @memberof QualityAlertState
   */
  public setQualityAlert(alertId: string): void {
    const alerts: GroupedAlert[] = this.qualityAlerts$.snapshot.data;
    const alertById = find(alerts, (alert: GroupedAlert) => alert.alertId === alertId);
    this.groupedAlert$.update(alertById);
  }

  /**
   * Alerts to be removed from the state
   *
   * @param {string[]} listOfAlerts
   * @return {void}
   * @memberof QualityAlertState
   */
  public removeAlerts(listOfAlerts?: string[]): void {
    const filtered: GroupedAlert[] = filter(
      this.qualityAlerts$.snapshot.data,
      alert => !listOfAlerts.includes(alert.alertId),
    );
    this.qualityAlerts$.update({ data: filtered });
  }

  /**
   * Filter alerts to be removed
   *
   * @param {number} [index]
   * @return {GroupedAlert[]}
   * @memberof QualityAlertState
   */
  public filterAlerts(index: number | string[]): GroupedAlert[] {
    const removedAlert: GroupedAlert = this.qualityAlerts$.snapshot.data[index as number];
    return this.qualityAlerts$.snapshot.data.filter((alert: GroupedAlert) => alert.alertId !== removedAlert.alertId);
  }

  /**
   * Removes serial numbers from the current grouped state
   *
   * @param {string} qualityType
   * @param {QualityAlertChildren[]} children
   * @return {void}
   * @memberof QualityAlertState
   */
  public updateAlert(qualityType: string, children?: QualityAlertChildren[]): void {
    const alert = this.groupedAlert$.snapshot;
    const icon = {
      OK: 'checkbox-circle-line',
      MAJOR: 'alert-line',
      CRITICAL: 'spam-line',
      MINOR: 'error-warning-line',
      'LIFE-THREATENING': 'close-circle-line',
    };
    const newFilteredAlert: GroupedAlert = {
      ...alert,
      children: children || alert.children,
      qualityType,
      numberOfParts: (children && children.length) || alert.numberOfParts,
      icon: icon[qualityType],
    };
    this.groupedAlert$.update({ ...newFilteredAlert });
  }

  /**
   * Quality alert status update
   *
   * @return {void}
   * @memberof QualityAlertState
   */
  public updateStatus(): void {
    const alert: GroupedAlert = this.groupedAlert$.snapshot;
    const alertWithNewStatus: GroupedAlert = {
      ...alert,
      status: 'committed',
    };
    this.groupedAlert$.update({ ...alertWithNewStatus });
  }
}
