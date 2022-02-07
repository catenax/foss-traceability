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

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { GroupedAlert } from 'src/app/quality-alert/model/grouped-alerts.model';

/**
 *
 *
 * @export
 * @class QualityAlertDetailSummaryComponent
 */
@Component({
  selector: 'app-quality-alert-detail-summary',
  templateUrl: './quality-alert-detail-summary.component.html',
  styleUrls: ['./quality-alert-detail-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QualityAlertDetailSummaryComponent {
  /**
   * Quality alert
   *
   * @type {GroupedAlert}
   * @memberof QualityAlertDetailSummaryComponent
   */
  @Input() qualityAlert: GroupedAlert;

  /**
   * Change quality alert emitter
   *
   * @type {EventEmitter<string>}
   * @memberof QualityAlertDetailSummaryComponent
   */
  @Output() changeQualityType: EventEmitter<string> = new EventEmitter<string>();

  /**
   * Emit the quality alert change
   *
   * @param {string} alertId
   * @return {void}
   * @memberof QualityAlertDetailSummaryComponent
   */
  public emitChange(alertId: string): void {
    this.changeQualityType.emit(alertId);
  }
}
