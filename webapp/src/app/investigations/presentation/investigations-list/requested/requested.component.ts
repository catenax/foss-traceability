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

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { QualityInvestigation } from 'src/app/investigations/model/quality-investigation.model';

/**
 *
 *
 * @export
 * @class RequestedComponent
 * @implements {OnChanges}
 */
@Component({
  selector: 'app-requested',
  templateUrl: './requested.component.html',
  styleUrls: ['./requested.component.scss'],
})
export class RequestedComponent implements OnChanges {
  /**
   * Requested quality investigation
   *
   * @type {QualityInvestigation[]}
   * @memberof RequestedComponent
   */
  @Input() requestedInvestigations: QualityInvestigation[];

  /**
   * Navigation emitter
   *
   * @type {EventEmitter<{ view: string; alertId: string }>}
   * @memberof RequestedComponent
   */
  @Output() triggerNavigation: EventEmitter<{ view: string; alertId: string }> = new EventEmitter();

  /**
   * Filtered requested investigations
   *
   * @type {QualityInvestigation[]}
   * @memberof RequestedComponent
   */
  public filteredRequestedInvestigations: QualityInvestigation[];

  /**
   * Page length
   *
   * @type {number}
   * @memberof RequestedComponent
   */
  public pageLength = 0;

  /**
   * Page size
   *
   * @type {number}
   * @memberof RequestedComponent
   */
  public pageSize = 10;

  /**
   * Angular lifecycle method - On Changes
   *
   * @param {SimpleChanges} changes
   * @memberof RequestedComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.requestedInvestigations) {
      this.pageLength = this.requestedInvestigations.length;
      this.filteredRequestedInvestigations = this.requestedInvestigations
        .slice((0 + 1 - 1) * this.pageSize)
        .slice(0, this.pageSize);
    }
  }

  /**
   * Trigger navigation
   *
   * @param {string} alertId
   * @return {void}
   * @memberof RequestedComponent
   */
  public viewDetails(alertId: string): void {
    this.triggerNavigation.emit({ view: 'requested', alertId });
  }

  /**
   * Change page event for pagination
   *
   * @param {PageEvent} event
   * @return {void}
   * @memberof RequestedComponent
   */
  public pageChangeEvent(event: PageEvent): void {
    const offset = (event.pageIndex + 1 - 1) * event.pageSize;
    this.filteredRequestedInvestigations = this.requestedInvestigations.slice(offset).slice(0, event.pageSize);
  }
}
