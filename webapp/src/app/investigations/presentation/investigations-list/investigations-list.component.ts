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

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Investigation } from '../../model/investigation.model';
import { filter } from 'lodash-es';
import { QualityInvestigation } from '../../model/quality-investigation.model';

/**
 *
 *
 * @export
 * @class InvestigationsListComponent
 * @implements {OnChanges}
 */
@Component({
  selector: 'app-investigations-list',
  templateUrl: './investigations-list.component.html',
  styleUrls: ['./investigations-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestigationsListComponent implements OnChanges {
  /**
   * List of quality investigations
   *
   * @type {Investigation[]}
   * @memberof InvestigationsListComponent
   */
  @Input() investigations: Investigation[];

  /**
   * Navigation emitter
   *
   * @type {EventEmitter<{ view: string; alertId: string }>}
   * @memberof InvestigationsListComponent
   */
  @Output() triggerNavigation: EventEmitter<{ view: string; alertId: string }> = new EventEmitter();

  /**
   * Commit quality investigation emitter
   *
   * @type {EventEmitter<{ view: string; alertId: string }>}
   * @memberof InvestigationsListComponent
   */
  @Output() triggerCommit: EventEmitter<{ view: string; alertId: string }> = new EventEmitter();

  /**
   * Delete quality investigation emitter
   *
   * @type {EventEmitter<{ view: string; alertId: string }>}
   * @memberof InvestigationsListComponent
   */
  @Output() triggerDelete: EventEmitter<{ view: string; alertId: string }> = new EventEmitter();

  /**
   * Received quality investigations
   *
   * @type {QualityInvestigation[]}
   * @memberof InvestigationsListComponent
   */
  public receivedInvestigations: QualityInvestigation[];

  /**
   * Queued quality investigations
   *
   * @type {QualityInvestigation[]}
   * @memberof InvestigationsListComponent
   */
  public queuedInvestigations: QualityInvestigation[];

  /**
   * Requested investigations
   *
   * @type {QualityInvestigation[]}
   * @memberof InvestigationsListComponent
   */
  public requestedInvestigations: QualityInvestigation[];

  /**
   * Angular lifecycle method - On Changes
   *
   * @param {SimpleChanges} changes
   * @return {void}
   * @memberof InvestigationsListComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    // TODO: MAP THIS STATUS TO ENUMS
    if (changes.investigations) {
      this.receivedInvestigations = filter(
        changes.investigations.currentValue,
        (investigation: QualityInvestigation) => investigation.status.toLocaleLowerCase() === 'external',
      );

      this.queuedInvestigations = filter(
        changes.investigations.currentValue,
        (investigation: QualityInvestigation) => investigation.status.toLocaleLowerCase() === 'pending',
      );

      this.requestedInvestigations = filter(
        changes.investigations.currentValue,
        (investigation: QualityInvestigation) => investigation.status.toLocaleLowerCase() === 'distributed',
      );
    }
  }

  /**
   * Trigger navigation
   *
   * @param {{ view: string; alertId: string }} view
   * @return {void}
   * @memberof InvestigationsListComponent
   */
  public viewDetails(view: { view: string; alertId: string }): void {
    this.triggerNavigation.emit(view);
  }

  /**
   * Trigger commit
   *
   * @param {{ view: string; alertId: string }} view
   * @return {void}
   * @memberof InvestigationsListComponent
   */
  public emitCommit(view: { view: string; alertId: string }): void {
    this.triggerCommit.emit(view);
  }

  /**
   * Trigger delete
   *
   * @param {{ view: string; alertId: string }} view
   * @return {void}
   * @memberof InvestigationsListComponent
   */
  public emitDelete(view: { view: string; alertId: string }): void {
    this.triggerDelete.emit(view);
  }
}
