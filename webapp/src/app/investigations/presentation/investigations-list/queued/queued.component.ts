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
  HostListener,
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
 * @class QueuedComponent
 * @implements {OnChanges}
 */
@Component({
  selector: 'app-queued',
  templateUrl: './queued.component.html',
  styleUrls: ['./queued.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueuedComponent implements OnChanges {
  /**
   * Queued quality investigations
   *
   * @type {QualityInvestigation[]}
   * @memberof QueuedComponent
   */
  @Input() queuedInvestigations: QualityInvestigation[];

  /**
   * Navigation emitter
   *
   * @type {EventEmitter<{ view: string; alertId: string }>}
   * @memberof QueuedComponent
   */
  @Output() triggerNavigation: EventEmitter<{ view: string; alertId: string }> = new EventEmitter();

  /**
   * Commit quality investigation emitter
   *
   * @type {EventEmitter<{ view: string; alertId: string }>}
   * @memberof QueuedComponent
   */
  @Output() triggerCommit: EventEmitter<{ view: string; alertId: string }> = new EventEmitter();

  /**
   * Delete quality investigation emitter
   *
   * @type {EventEmitter<{ view: string; alertId: string }>}
   * @memberof QueuedComponent
   */
  @Output() triggerDelete: EventEmitter<{ view: string; alertId: string }> = new EventEmitter();

  /**
   * Is list menu expanded
   *
   * @type {boolean}
   * @memberof QueuedComponent
   */
  public isExpanded: boolean;

  /**
   * Selected alert id
   *
   * @type {string}
   * @memberof QueuedComponent
   */
  public alertId: string;

  /**
   * Menu position
   *
   * @type {string}
   * @memberof QueuedComponent
   */
  public menuPositionY: string;

  /**
   * Active index
   *
   * @type {number}
   * @memberof QueuedComponent
   */
  public activeIndex: number;

  /**
   * Page length
   *
   * @type {number}
   * @memberof QueuedComponent
   */
  public pageLength = 0;

  /**
   * Page size
   *
   * @type {number}
   * @memberof QueuedComponent
   */
  public pageSize = 10;

  /**
   * Filtered queued quality investigations
   *
   * @type {QualityInvestigation[]}
   * @memberof QueuedComponent
   */
  public filteredQueuedInvestigations: QualityInvestigation[];

  /**
   * Angular lifecycle method - On Changes
   *
   * @param {SimpleChanges} changes
   * @memberof QueuedComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.queuedInvestigations) {
      this.isExpanded = false;
      this.pageLength = this.queuedInvestigations.length;
      this.filteredQueuedInvestigations = this.queuedInvestigations
        .slice((0 + 1 - 1) * this.pageSize)
        .slice(0, this.pageSize);
    }
  }

  /**
   * Menu expand event
   *
   * @param {Event} event
   * @param {number} index
   * @param {string} alertId
   * @return {void}
   * @memberof NavBarComponent
   */
  public expand(event: MouseEvent, index: number, alertId: string): void {
    if (event) {
      event.stopPropagation();
      this.isExpanded = !this.isExpanded;
      this.activeIndex = index;
      this.alertId = alertId;
      this.menuPositionY = `${event.clientY + 20}px`;
    }
  }

  /**
   * Trigger navigation
   *
   * @return {void}
   * @memberof QueuedComponent
   */
  public viewDetails(): void {
    this.triggerNavigation.emit({ view: 'queued', alertId: this.alertId });
  }

  /**
   * On click listener
   *
   * @private
   * @return {void}
   * @memberof NavBarComponent
   */
  @HostListener('window:click', [])
  private onClick(): void {
    this.isExpanded = false;
  }

  /**
   * Trigger commit quality investigation
   *
   * @return {void}
   * @memberof QueuedComponent
   */
  public emitCommit(): void {
    this.triggerCommit.emit({ view: 'queued', alertId: this.alertId });
  }

  /**
   * Trigger delete quality investigation
   *
   * @return {void}
   * @memberof QueuedComponent
   */
  public emitDelete(): void {
    this.triggerDelete.emit({ view: 'queued', alertId: this.alertId });
  }

  /**
   * Change page event for pagination
   *
   * @param {PageEvent} event
   * @return {void}
   * @memberof QueuedComponent
   */
  public pageChangeEvent(event: PageEvent): void {
    const offset = (event.pageIndex + 1 - 1) * event.pageSize;
    this.filteredQueuedInvestigations = this.queuedInvestigations.slice(offset).slice(0, event.pageSize);
  }
}
