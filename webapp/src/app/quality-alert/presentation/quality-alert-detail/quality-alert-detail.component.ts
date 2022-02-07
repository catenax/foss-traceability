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
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import {
  ConfirmDialogComponent,
  ConfirmDialogModel,
} from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { QualityAlertFacade } from '../../abstraction/quality-alert.facade';
import { GroupedAlert } from '../../model/grouped-alerts.model';
import { QualityAlertEditTypeComponent } from '../quality-alert-edit-type/quality-alert-edit-type.component';
import { QualityAlertUpdatePartsComponent } from '../quality-alert-update-parts/quality-alert-update-parts.component';

/**
 *
 *
 * @export
 * @class QualityAlertDetailComponent
 */
@Component({
  selector: 'app-quality-alert-detail',
  templateUrl: './quality-alert-detail.component.html',
  styleUrls: ['./quality-alert-detail.component.scss'],
})
export class QualityAlertDetailComponent {
  /**
   * Quality alert
   *
   * @type {GroupedAlert}
   * @memberof QualityAlertDetailComponent
   */
  public qualityAlert$: Observable<GroupedAlert>;

  /**
   * Page title
   *
   * @type {string}
   * @memberof QualityAlertDetailComponent
   */
  public pageTitle: string;

  /**
   * @constructor QualityAlertDetailComponent
   * @param {QualityAlertFacade} qualityAlertFacade
   * @param {ActivatedRoute} route
   * @param {MatDialog} dialog
   * @memberof QualityAlertDetailComponent
   */
  constructor(
    private qualityAlertFacade: QualityAlertFacade,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {
    this.route.params.subscribe(params => {
      this.qualityAlertFacade.getQualityAlert(params['id']);
    });

    this.qualityAlert$ = this.qualityAlertFacade.groupedAlert$;
  }

  /**
   * Table title getter
   *
   * @param {GroupedAlert} qualityAlert
   * @return {string}
   * @memberof QualityAlertDetailComponent
   */
  public getTableSectionTitle(qualityAlert: GroupedAlert): string {
    return qualityAlert.type === 'Queued'
      ? `Parts changed from ${qualityAlert.previousQualityType} to ${qualityAlert.qualityType}`
      : `Parts affected by ${qualityAlert.qualityType} issue`;
  }

  /**
   * Add parts dialog
   *
   * @param {GroupedAlert} qualityAlert
   * @return {void}
   * @memberof QualityAlertDetailComponent
   */
  public addParts(qualityAlert: GroupedAlert): void {
    const dialogRef = this.dialog.open(QualityAlertUpdatePartsComponent, {
      width: '800px',
      panelClass: 'custom-dialog-container',
      data: qualityAlert.children,
    });
    dialogRef.afterClosed().subscribe();
  }

  /**
   * Update quality type dialog
   *
   * @param {string} alertId
   * @return {void}
   * @memberof QualityAlertDetailComponent
   */
  public changeQualityType(alertId: string): void {
    const dialogRef = this.dialog.open(QualityAlertEditTypeComponent, {
      width: '400px',
      panelClass: 'custom-dialog-container',
      data: alertId,
    });
    dialogRef.afterClosed().subscribe();
  }

  /**
   * Commit a quality alert
   *
   * @param {string} view
   * @param {string} alertId
   * @return {void}
   * @memberof QualityAlertDetailComponent
   */
  public commitAlert(view: string, alertId: string): void {
    this.qualityAlertFacade.commitQualityAlerts(view.toLocaleLowerCase(), [alertId]);
  }

  /**
   * Discard a quality alert
   *
   * @param {string} view
   * @param {string} alertId
   * @memberof QualityAlertDetailComponent
   */
  public discardAlert(view: string, alertId: string): void {
    const message = `This action is irreversible`;
    const dialogData = new ConfirmDialogModel(
      'Discard quality change',
      message,
      'error',
      false,
      'Discard change',
      'Keep on list',
    );
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      panelClass: 'custom-dialog-container',
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.qualityAlertFacade.discardQualityAlerts(view.toLocaleLowerCase(), [alertId]);
      }
    });
  }
}
