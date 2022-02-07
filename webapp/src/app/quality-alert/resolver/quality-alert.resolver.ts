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
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { QualityAlertFacade } from '../abstraction/quality-alert.facade';
import { GroupedAlert } from '../model/grouped-alerts.model';

/**
 *
 *
 * @export
 * @class QualityAlertResolver
 * @implements {Resolve<GroupedAlert[]>}
 */
@Injectable()
export class QualityAlertResolver implements Resolve<GroupedAlert[]> {
  /**
   * @constructor QualityAlertResolver
   * @param {QualityAlertFacade} qualityAlertFacade
   * @memberof QualityAlertResolver
   */
  constructor(private qualityAlertFacade: QualityAlertFacade) {}

  /**
   * Quality alert route resolver
   *
   * @return {(GroupedAlert[] | Observable<GroupedAlert[]> | Promise<GroupedAlert[]>)}
   * @memberof QualityAlertResolver
   */
  resolve(): GroupedAlert[] | Observable<GroupedAlert[]> | Promise<GroupedAlert[]> {
    const qualityAlerts = this.qualityAlertFacade.qualityAlertsSnapshot;
    return qualityAlerts && qualityAlerts.length ? qualityAlerts : this.qualityAlertFacade.getQualityAlerts();
  }
}
