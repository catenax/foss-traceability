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
import { filter, find, map } from 'lodash-es';
import { Moment } from 'moment';
import { Observable } from 'rxjs';
import { AssetAssembler } from 'src/app/shared/core/asset.assembler';
import { Asset } from 'src/app/shared/model/asset.model';
import { State } from 'src/app/shared/model/state';
import { View } from 'src/app/shared/model/view.model';
import { Investigation } from '../model/investigation.model';
import { QualityInvestigation } from '../model/quality-investigation.model';
import { InvestigationAssembler } from './investigation.assembler';

/**
 *
 *
 * @export
 * @class InvestigationsState
 */
@Injectable()
export class InvestigationsState {
  /**
   * Quality investigation state
   *
   * @private
   * @readonly
   * @type {State<View<QualityInvestigation[]>>}
   * @memberof InvestigationsState
   */
  private readonly investigations$: State<View<QualityInvestigation[]>> = new State<View<QualityInvestigation[]>>({
    loader: true,
  });

  /**
   * Quality investigation status state
   *
   * @private
   * @type {State<string>}
   * @memberof InvestigationsState
   */
  private readonly investigationStatus$: State<string> = new State<string>('');

  /**
   * Parts state
   *
   * @private
   * @type {State<View<Asset[]>>}
   * @memberof InvestigationsState
   */
  private readonly parts$: State<View<Asset[]>> = new State<View<Asset[]>>({ loader: true });

  /**
   * Raised parts state
   *
   * @private
   * @type {State<View<Asset[]>>}
   * @memberof InvestigationsState
   */
  private readonly raisedParts$: State<View<Asset[]>> = new State<View<Asset[]>>({ loader: true });

  private datePickerProps: {
    ranges: Record<string, Moment[]>;
    locale: { format: string; displayFormat: string; customRangeLabel: string };
  };

  /**
   * Quality investigation getter
   *
   * @readonly
   * @type {Observable<View<QualityInvestigation[]>>}
   * @memberof InvestigationsState
   */
  get getInvestigations$(): Observable<View<QualityInvestigation[]>> {
    return this.investigations$.observable;
  }

  //TODO: TEMPORARY OPTION TO HANDLE THE STATUS AFTER COMMIT. LATER ON WE SHOULD CREATE A STATE FOR AN INVESTIGATION
  /**
   * Quality investigation status state getter
   *
   * @readonly
   * @type {Observable<string>}
   * @memberof InvestigationsState
   */
  get getInvestigationStatus$(): Observable<string> {
    return this.investigationStatus$.observable;
  }

  /**
   * Parts state getter
   *
   * @readonly
   * @type {Observable<View<Asset[]>>}
   * @memberof InvestigationsState
   */
  get getParts$(): Observable<View<Asset[]>> {
    this.parts$.reset();
    return this.parts$.observable;
  }

  /**
   * Raised parts state getter
   *
   * @readonly
   * @type {Observable<View<Asset[]>>}
   * @memberof InvestigationsState
   */
  get getRaisedParts$(): Observable<View<Asset[]>> {
    this.resetRaisedParts();
    return this.raisedParts$.observable;
  }

  /**
   * Form builder
   *
   * @readonly
   * @type {FormGroup}
   * @memberof InvestigationsState
   */
  get getInvestigationForm(): FormGroup {
    const builder = new FormBuilder();
    return builder.group({
      description: [''],
    });
  }

  /**
   * Raise alert form
   *
   * @readonly
   * @type {FormGroup}
   * @memberof InvestigationsState
   */
  get getInvestigationRaiseForm(): FormGroup {
    const builder = new FormBuilder();
    return builder.group({
      type: ['', Validators.required],
      description: [''],
    });
  }

  /**
   * Quality Investigation snapshot getter
   *
   * @readonly
   * @type {View<Investigation[]>}
   * @memberof InvestigationsState
   */
  get getInvestigationsSnapshot(): QualityInvestigation[] {
    return this.investigations$.snapshot.data;
  }

  /**
   * Get quality investigation by alert id
   *
   * @param {string} alertId
   * @return {QualityInvestigation}
   * @memberof InvestigationsState
   */
  public getInvestigationById(alertId: string): QualityInvestigation {
    const investigations: QualityInvestigation[] = this.investigations$.snapshot.data;
    return find(investigations, ['alertId', alertId]);
  }

  get getDatePickerProps(): {
    ranges: Record<string, Moment[]>;
    locale: { format: string; displayFormat: string; customRangeLabel: string };
  } {
    return this.datePickerProps;
  }

  /**
   * Quality investigation state setter
   *
   * @param {View<Investigation[]>} investigationAlert
   * @return {void}
   * @memberof InvestigationsState
   */
  public setInvestigations(investigationAlert: View<Investigation[]>): void {
    const investigationAlertView: View<QualityInvestigation[]> = {
      data: investigationAlert.data && InvestigationAssembler.assembleQualityInvestigations(investigationAlert.data),
      loader: investigationAlert.loader,
      error: investigationAlert.error,
    };
    this.investigations$.update(investigationAlertView);
  }

  /**
   * Quality investigation status state setter
   *
   * @param {string} status
   * @return {void}
   * @memberof InvestigationsState
   */
  public setInvestigationStatus(status: string): void {
    this.investigationStatus$.update(status);
  }

  /**
   * Quality investigation state reset
   *
   * @return {void}
   * @memberof InvestigationsState
   */
  public resetInvestigation(): void {
    this.investigations$.reset();
  }

  /**
   * Parts state setter
   *
   * @param {View<Asset[]>} assets
   * @return {void}
   * @memberof InvestigationsState
   */
  public setParts(assets: View<Asset[]>): void {
    this.parts$.update(assets);
  }

  /**
   * Raised parts state setter
   *
   * @param {View<Asset[]>} assets
   * @return {void}
   * @memberof InvestigationsState
   */
  public setRaisedParts(assets: View<Asset[]>): void {
    const raisedAssets: View<Asset[]> = {
      data:
        assets.data &&
        filter(
          [...map(assets.data, asset => AssetAssembler.assembleAsset(asset))],
          filteredAsset => filteredAsset.qualityStatus === 'OK',
        ),
      loader: assets.loader,
      error: assets.error,
    };

    this.raisedParts$.update(raisedAssets);
  }

  /**
   * Reset raised parts
   *
   * @return {void}
   * @memberof InvestigationsState
   */
  public resetRaisedParts(): void {
    this.raisedParts$.reset();
  }

  public setDatePickerProps(datePickerProps: {
    ranges: Record<string, Moment[]>;
    locale: { format: string; displayFormat: string; customRangeLabel: string };
  }): void {
    this.datePickerProps = datePickerProps;
  }
}
