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
import { delay, map } from 'rxjs/operators';
import { View } from 'src/app/shared/model/view.model';
import { InvestigationsService } from '../core/investigations.service';
import { InvestigationsState } from '../core/investigations.state';
import { Investigation } from '../model/investigation.model';
import { FormGroup } from '@angular/forms';
import { QualityInvestigation } from '../model/quality-investigation.model';
import { AssetFilter } from 'src/app/assets/model/asset-filter.model';
import { fields } from 'src/app/assets/model/assets-list.model';
import { Asset } from 'src/app/shared/model/asset.model';
import { QualityAlertService } from 'src/app/quality-alert/core/quality-alert.service';
import { NotificationService } from 'src/app/shared/components/notifications/notification.service';
import { InvestigationAssembler } from '../core/investigation.assembler';
import { SpinnerOverlayService } from 'src/app/layout/presentation/spinner-overlay/core/spinner-overlay.service';
import { LayoutFacade } from 'src/app/shared/abstraction/layout-facade';
import { filter, map as lodashMap, flatten } from 'lodash-es';
import { QualityAlert, QualityAlertTypes } from 'src/app/quality-alert/model/quality-alert.model';
import { Router } from '@angular/router';
import { realm } from 'src/app/core/api/api.service.properties';
import { Moment } from 'moment';
import * as moment from 'moment/moment';

/**
 *
 *
 * @export
 * @class InvestigationsFacade
 */
@Injectable()
export class InvestigationsFacade {
  /**
   * @constructor InvestigationsFacade (DI)
   * @param {InvestigationsService} investigationsService
   * @param {InvestigationsState} investigationsState
   * @param {QualityAlertService} qualityAlertService
   * @param {NotificationService} notificationService
   * @param {SpinnerOverlayService} spinnerOverlayService
   * @param {LayoutFacade} layoutFacade
   * @param {Router} router
   * @memberof InvestigationsFacade
   */
  constructor(
    private investigationsService: InvestigationsService,
    private investigationsState: InvestigationsState,
    private qualityAlertService: QualityAlertService,
    private notificationService: NotificationService,
    private spinnerOverlayService: SpinnerOverlayService,
    private layoutFacade: LayoutFacade,
    private router: Router,
  ) {}

  /**
   * Quality investigations getter
   *
   * @readonly
   * @type {Observable<View<Investigation[]>>}
   * @memberof InvestigationsFacade
   */
  get investigations$(): Observable<View<QualityInvestigation[]>> {
    return this.investigationsState.getInvestigations$.pipe(delay(0));
  }

  /**
   * Quality investigation status getter
   *
   * @readonly
   * @type {Observable<string>}
   * @memberof InvestigationsFacade
   */
  get investigationStatus$(): Observable<string> {
    return this.investigationsState.getInvestigationStatus$;
  }

  /**
   * Quality investigation snapshot
   *
   * @readonly
   * @type {QualityInvestigation[]}
   * @memberof InvestigationsFacade
   */
  get investigationsSnapshot(): QualityInvestigation[] {
    return this.investigationsState.getInvestigationsSnapshot;
  }

  /**
   * Parts getter
   *
   * @readonly
   * @type {Observable<View<Asset[]>>}
   * @memberof InvestigationsFacade
   */
  get parts$(): Observable<View<Asset[]>> {
    return this.investigationsState.getParts$.pipe(delay(0));
  }

  /**
   * Raised parts getter
   *
   * @readonly
   * @type {Observable<View<Asset[]>>}
   * @memberof InvestigationsFacade
   */
  get raisedParts$(): Observable<View<Asset[]>> {
    return this.investigationsState.getRaisedParts$.pipe(delay(0));
  }

  /**
   * Investigation Form
   *
   * @readonly
   * @type {FormGroup}
   * @memberof InvestigationsFacade
   */
  get investigationForm(): FormGroup {
    return this.investigationsState.getInvestigationForm;
  }

  /**
   * Raised form getter
   *
   * @readonly
   * @type {FormGroup}
   * @memberof InvestigationsFacade
   */
  get investigationRaiseForm(): FormGroup {
    return this.investigationsState.getInvestigationRaiseForm;
  }

  get datePickerProps(): {
    ranges: Record<string, Moment[]>;
    locale: { format: string; displayFormat: string; customRangeLabel: string };
  } {
    return this.investigationsState.getDatePickerProps;
  }

  //TODO: RETHINK THIS LOGIC FOR THE RESOLVER
  /**
   * Get all investigations request to be consumed by the router resolver
   *
   * @return {Observable<QualityInvestigation[]>}
   * @memberof InvestigationsFacade
   */
  public getInvestigations(): Observable<QualityInvestigation[]> {
    return this.investigationsService.getInvestigations().pipe(
      map(investigations => {
        this.investigationsState.setInvestigations({ data: investigations });
        return InvestigationAssembler.assembleQualityInvestigations(investigations);
      }),
    );
  }

  /**
   * Investigations setter
   *
   * @return {void}
   * @memberof InvestigationsFacade
   */
  public setInvestigations(): void {
    this.investigationsState.setInvestigations({ loader: true });
    this.investigationsService.getInvestigations().subscribe(
      (investigations: Investigation[]) => {
        const externalInvestigations = filter(
          investigations,
          (investigation: Investigation) => investigation.status === QualityAlertTypes.EXTERNAL,
        );
        const queuedInvestigations = filter(
          investigations,
          (investigation: Investigation) => investigation.status === QualityAlertTypes.PENDING,
        );
        const investigationParts: QualityAlert[] = flatten(
          lodashMap(externalInvestigations, (investigation: Investigation) => investigation.partsAffected),
        );

        const queuedInvestigationParts: QualityAlert[] = flatten(
          lodashMap(queuedInvestigations, (investigation: Investigation) => investigation.partsAffected),
        );

        this.layoutFacade.setReceivedQualityInvestigationsCounter(investigationParts.length);
        this.layoutFacade.setQueuedQualityInvestigations(queuedInvestigationParts.length);
        this.investigationsState.setInvestigations({ data: investigations });
      },
      error => this.investigationsState.setInvestigations({ error }),
    );
  }

  /**
   * Quality investigation status setter
   *
   * @param {string} status
   * @return {void}
   * @memberof InvestigationsFacade
   */
  public setInvestigationStatus(status: string): void {
    this.investigationsState.setInvestigationStatus(status);
  }

  /**
   * Get investigation by alert id
   *
   * @param {string} alertId
   * @return {QualityInvestigation}
   * @memberof InvestigationsFacade
   */
  public getInvestigationById(alertId: string): QualityInvestigation {
    return this.investigationsState.getInvestigationById(alertId);
  }

  /**
   * Parts setter
   *
   * @param {AssetFilter} assetFilter
   * @return {void}
   * @memberof InvestigationsFacade
   */
  public setParts(assetFilter: AssetFilter): void {
    this.investigationsState.setParts({ loader: true });
    this.investigationsService.getParts(assetFilter, fields).subscribe(
      (assets: Asset[]) => {
        this.investigationsState.setParts({ data: assets });
      },
      error => this.investigationsState.setParts({ error }),
    );
  }

  /**
   * Raised parts setter
   *
   * @param {AssetFilter} raisedAssetsFilter
   * @return {void}
   * @memberof InvestigationsFacade
   */
  public setRaisedParts(raisedAssetsFilter: AssetFilter): void {
    this.investigationsState.setRaisedParts({ loader: true });
    this.investigationsService.getParts(raisedAssetsFilter, fields).subscribe(
      (raisedAssets: Asset[]) => this.investigationsState.setRaisedParts({ data: raisedAssets }),
      error => this.investigationsState.setRaisedParts({ error }),
    );
  }

  /**
   * List of alert ids to be committed
   *
   * @param {string[]} alertIds
   * @return {void}
   * @memberof InvestigationsFacade
   */
  public commitQualityInvestigations(alertIds: string[]): void {
    this.notificationService.info('Your request is being processed in the background', 5000);
    this.spinnerOverlayService.setOverlay(true);
    this.qualityAlertService.commitQualityAlert(alertIds).subscribe(
      () => {
        this.notificationService.success(
          'Quality investigation status change requested. See it on the "Requested" tab',
          5000,
        );
        this.setInvestigations();
        this.setInvestigationStatus('requested');
        this.spinnerOverlayService.setOverlay(false);
      },
      () => this.setInvestigations(),
    );
  }

  /**
   * List of alert ids to be deleted
   *
   * @param {string[]} alertIds
   * @return {void}
   * @memberof InvestigationsFacade
   */
  public deleteQualityInvestigation(alertIds: string[]): void {
    this.spinnerOverlayService.setOverlay(true);
    this.qualityAlertService.deleteQualityAlerts(alertIds).subscribe(
      () => {
        if (this.router.url.includes(alertIds.toString())) {
          this.router.navigate([`${realm[1]}/investigations`]).then();
        } else {
          this.notificationService.success('Quality investigation status change discarded', 5000);
          this.setInvestigations();
        }
        this.spinnerOverlayService.setOverlay(false);
      },
      () => this.setInvestigations(),
    );
  }

  public setDatePickerProps(): void {
    const ranges = {
      'Same Day': [moment()],
      'Same Week': [moment().subtract(6, 'days'), moment()],
      'Same Month': [moment().subtract(29, 'days'), moment()],
    };
    const locale = {
      format: 'DD/MM/YYYY',
      displayFormat: 'DD/MM/YYYY',
      customRangeLabel: 'Custom date',
    };
    this.investigationsState.setDatePickerProps({ ranges, locale });
  }
}
