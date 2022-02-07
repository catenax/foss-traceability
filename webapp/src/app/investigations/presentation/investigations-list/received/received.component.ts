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
import { PageEvent } from '@angular/material/paginator';
import { QualityInvestigation } from 'src/app/investigations/model/quality-investigation.model';

/**
 *
 *
 * @export
 * @class ReceivedComponent
 * @implements {OnChanges}
 */
@Component({
  selector: 'app-received',
  templateUrl: './received.component.html',
  styleUrls: ['./received.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceivedComponent implements OnChanges {
  /**
   * Received quality investigations
   *
   * @type {QualityInvestigation[]}
   * @memberof ReceivedComponent
   */
  @Input() receivedInvestigations: QualityInvestigation[];

  /**
   * Navigation emitter
   *
   * @type {EventEmitter<{ view: string; alertId: string }>}
   * @memberof ReceivedComponent
   */
  @Output() triggerNavigation: EventEmitter<{ view: string; alertId: string }> = new EventEmitter();

  /**
   * Delete quality investigation emitter
   *
   * @type {EventEmitter<{ view: string; alertId: string }>}
   * @memberof ReceivedComponent
   */
  @Output() triggerDelete: EventEmitter<{ view: string; alertId: string }> = new EventEmitter();

  /**
   * Page length
   *
   * @type {number}
   * @memberof ReceivedComponent
   */
  public pageLength = 0;

  /**
   * Page size
   *
   * @type {number}
   * @memberof ReceivedComponent
   */
  public pageSize = 10;

  /**
   * Filtered received quality investigations
   *
   * @type {QualityInvestigation[]}
   * @memberof ReceivedComponent
   */
  public filteredReceivedInvestigations: QualityInvestigation[];

  /**
   * Angular lifecycle method - On Changes
   *
   * @param {SimpleChanges} changes
   * @return {void}
   * @memberof ReceivedComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.receivedInvestigations) {
      this.pageLength = this.receivedInvestigations.length;
      this.filteredReceivedInvestigations = this.receivedInvestigations
        .slice((0 + 1 - 1) * this.pageSize)
        .slice(0, this.pageSize);
    }
  }

  /**
   * Trigger navigation
   *
   * @param {string} alertId
   * @return {void}
   * @memberof ReceivedComponent
   */
  public viewDetails(alertId: string): void {
    this.triggerNavigation.emit({ view: 'received', alertId });
  }

  /**
   * Trigger delete quality investigation
   *
   * @param {string} alertId
   * @return {void}
   * @memberof ReceivedComponent
   */
  public emitDelete(alertId: string): void {
    this.triggerDelete.emit({ view: 'received', alertId });
  }

  /**
   * Change page event for pagination
   *
   * @param {PageEvent} event
   * @return {void}
   * @memberof ReceivedComponent
   */
  public pageChangeEvent(event: PageEvent): void {
    const offset = (event.pageIndex + 1 - 1) * event.pageSize;
    this.filteredReceivedInvestigations = this.receivedInvestigations.slice(offset).slice(0, event.pageSize);
  }
}
