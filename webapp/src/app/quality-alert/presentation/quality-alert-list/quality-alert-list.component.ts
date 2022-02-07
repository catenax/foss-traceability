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

import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { filter, remove } from 'lodash-es';
import { GroupedAlert } from '../../model/grouped-alerts.model';
import { QualityAlertTypes } from '../../model/quality-alert.model';

/**
 *
 *
 * @export
 * @class QualityAlertListComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-quality-alert-list',
  templateUrl: './quality-alert-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QualityAlertListComponent implements OnChanges {
  /**
   * Quality alerts
   *
   * @type {GroupedAlert[]}
   * @memberof QualityAlertListComponent
   */
  @Input() qualityAlerts: GroupedAlert[];

  /**
   * Received quality alerts
   *
   * @type {GroupedAlert[]}
   * @memberof QualityAlertListComponent
   */
  public receivedQualityAlerts: GroupedAlert[];

  /**
   *Queued quality alerts
   *
   * @type {GroupedAlert[]}
   * @memberof QualityAlertListComponent
   */
  public queuedQualityAlerts: GroupedAlert[];

  /**
   * Distributed quality alerts
   *
   * @type {GroupedAlert[]}
   * @memberof QualityAlertListComponent
   */
  public distributedQualityAlerts: GroupedAlert[];

  /**
   * Angular lifecycle ng on changes
   *
   * @param {SimpleChanges} changes
   * @memberof QualityAlertListComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.qualityAlerts) {
      const alerts: GroupedAlert[] = changes.qualityAlerts.currentValue;

      const pendingAlerts: GroupedAlert[] = filter(
        alerts,
        queuedAlert => queuedAlert.status === QualityAlertTypes.PENDING,
      );

      this.queuedQualityAlerts = pendingAlerts.filter(alert =>
        remove(alert.children, part => part.status !== QualityAlertTypes.PENDING),
      );

      const externalAlerts: GroupedAlert[] = filter(
        alerts,
        distributedAlerts => distributedAlerts.status === QualityAlertTypes.CREATED,
      );

      this.receivedQualityAlerts = externalAlerts.filter(external =>
        remove(external.children, part => part.status !== QualityAlertTypes.PENDING),
      );

      this.distributedQualityAlerts = filter(
        alerts,
        distributed => distributed.status === QualityAlertTypes.DISTRIBUTED,
      );
    }
  }
}
