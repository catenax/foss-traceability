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
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import {
  ConfirmDialogComponent,
  ConfirmDialogModel,
} from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { Table } from 'src/app/shared/components/table/table';
import { GroupedAlert } from '../../../quality-alert/model/grouped-alerts.model';
import { QualityAlertFacade } from '../../../quality-alert/abstraction/quality-alert.facade';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { findIndex, isEmpty, map } from 'lodash-es';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutFacade } from '../../abstraction/layout-facade';

/**
 *
 *
 * @export
 * @class QualityAlertAccordionComponent
 */
@Component({
  selector: 'app-quality-alert-accordion',
  templateUrl: './quality-alert-accordion.component.html',
  styleUrls: ['./quality-alert-accordion.component.scss'],
})
export class QualityAlertAccordionComponent implements OnChanges {
  /**
   * Grouped alerts
   *
   * @type {GroupedAlert[]}
   * @memberof QualityAlertAccordionComponent
   */
  @Input() qualityAlerts: GroupedAlert[];

  /**
   * View has actions to process quality alerts
   *
   * @type {boolean}
   * @memberof QualityAlertAccordionComponent
   */
  @Input() hasActions: boolean;

  /**
   * Table builder
   *
   * @type {Table}
   * @memberof QualityAlertAccordionComponent
   */
  @Input() table: Table;

  /**
   * Tab title
   *
   * @type {string}
   * @memberof QualityAlertAccordionComponent
   */
  @Input() title: string;

  /**
   * Tab view
   *
   * @type {string}
   * @memberof QualityAlertAccordionComponent
   */
  @Input() view: string;

  /**
   * Distributed alert filter values
   *
   * @type {string[]}
   * @memberof QualityAlertAccordionComponent
   */
  @Input() distributedFilterItems: string[];

  /**
   * Apply shadow on the accordion
   *
   * @type {boolean}
   * @memberof QualityAlertAccordionComponent
   */
  @Input() applyShadow: boolean;

  /**
   * Empty state title
   *
   * @type {string}
   * @memberof QualityAlertAccordionComponent
   */
  @Input() emptyStateTitle: string;

  /**
   * Empty state image
   *
   * @type {string}
   * @memberof QualityAlertAccordionComponent
   */
  @Input() emptyStateImage: string;

  /**
   * Empty state label
   *
   * @type {string}
   * @memberof QualityAlertAccordionComponent
   */
  @Input() emptyStateLabel: string;

  /**
   * Accordion with pagination
   *
   * @type {boolean}
   * @memberof QualityAlertAccordionComponent
   */
  @Input() hasPagination: boolean;

  /**
   * Filtered alerts
   *
   * @type {GroupedAlert[]}
   * @memberof QualityAlertAccordionComponent
   */
  public filteredQualityAlerts: GroupedAlert[] = [];

  /**
   * Full alerts
   *
   * @type {GroupedAlert[]}
   * @memberof QualityAlertAccordionComponent
   */
  public fullAlerts: GroupedAlert[] = [];

  /**
   * Page length
   *
   * @type {number}
   * @memberof QualityAlertAccordionComponent
   */
  public pageLength = 0;

  /**
   * Page size
   *
   * @type {number}
   * @memberof QualityAlertAccordionComponent
   */
  public pageSize = 5;

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
   * Quality type form
   *
   * @type {FormGroup}
   * @memberof QualityAlertAccordionComponent
   */
  public qualityTypeForm: FormGroup;

  /**
   * Accordion element
   *
   * @type {QueryList<ElementRef>}
   * @memberof QualityAlertAccordionComponent
   */
  @ViewChildren('accordion', { read: ElementRef }) accordion: QueryList<ElementRef>;

  /**
   * @constructor QualityAlertAccordionComponent.
   * @param {QualityAlertFacade} qualityAlertFacade
   * @param {MatDialog} dialog
   * @param {LayoutFacade} layoutFacade
   * @param {Router} router
   * @param {ActivatedRoute} activeRoute
   * @memberof QualityAlertAccordionComponent
   */
  constructor(
    private qualityAlertFacade: QualityAlertFacade,
    private layoutFacade: LayoutFacade,
    private dialog: MatDialog,
    private router: Router,
    private activeRoute: ActivatedRoute,
  ) {
    this.qualityTypeForm = this.qualityAlertFacade.getQualityAlertTypeForm;
    this.activeIndex = 0;
  }

  /**
   * Angular lifecycle method - Ng on changes
   *
   * @param {SimpleChanges} changes
   * @return {void}
   * @memberof QualityAlertAccordionComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.qualityAlerts.currentValue) {
      this.fullAlerts = changes.qualityAlerts.currentValue;
      this.pageLength = changes.qualityAlerts.currentValue.length;
      this.filteredQualityAlerts = changes.qualityAlerts.currentValue
        .slice((0 + 1 - 1) * this.pageSize)
        .slice(0, this.pageSize);

      if (this.distributedFilterItems && this.distributedFilterItems.length) {
        const data = {
          type: 'Queued',
        };
        this.setDistributedAlerts(data);
        this.qualityTypeForm.valueChanges.subscribe((formValues: { type: string }) => {
          this.setDistributedAlerts(formValues);
        });
      }
    }
  }

  /**
   * Toggle expand
   *
   * @param {MouseEvent} event
   * @param {number} index
   * @param {GroupedAlert} item
   * @return {void}
   * @memberof QualityAlertAccordionComponent
   */
  public toggleAccordion(event: MouseEvent, index: number, item: GroupedAlert): void {
    event.preventDefault();
    const element = this.accordion.toArray()[index].nativeElement;
    const idx = findIndex(this.qualityAlerts, alert => alert.alertId === item.alertId);

    element.classList.toggle('active');
    this.qualityAlerts[idx].isActive = !this.qualityAlerts[idx].isActive;

    const panel = element.nextElementSibling;

    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  }

  /**
   * Accordion menu expand
   *
   * @param {PointerEvent} event
   * @param {number} index
   * @memberof QualityAlertAccordionComponent
   */
  public expand(event: MouseEvent, index: number): void {
    if (event) {
      event.stopPropagation();
      this.isExpanded = !this.isExpanded;
      this.activeIndex = index;
      this.menuPositionY = `${event.clientY + 20}px`;
    }
  }

  /**
   * View alert details
   *
   * @param {string} [alertIdFromView]
   * @return {void}
   * @memberof QualityAlertAccordionComponent
   */
  public viewDetails(alertIdFromView?: string): void {
    const { alertId } = this.qualityAlerts[this.activeIndex];
    const id = alertIdFromView ? alertIdFromView : alertId;
    const route = this.router.url.includes('quality-alert') ? `${id}` : `quality-alert/${id}`;
    this.router
      .navigate([`${route}`], {
        relativeTo: this.activeRoute,
      })
      .then();
    const tab = {
      received: 0,
      queued: 1,
      raised: 2,
    };
    const tabIndex: number = tab[this.view];
    this.layoutFacade.setTabIndex(tabIndex);
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
   * Commit all alerts
   *
   * @return {void}
   * @memberof QualityAlertListQueuedComponent
   */
  public commitAll(): void {
    const alertList: string[] = map(this.filteredQualityAlerts, alert => alert.alertId);
    this.qualityAlertFacade.commitQualityAlerts(this.view, alertList);
  }

  /**
   * Commit one grouped alert
   *
   * @return {void}
   * @memberof QualityAlertListQueuedComponent
   */
  public commitOne(): void {
    const alertList: string[] = [this.filteredQualityAlerts[this.activeIndex].alertId];
    this.qualityAlertFacade.commitQualityAlerts(this.view, alertList);
  }

  /**
   * Delete all alerts
   *
   * @return {void}
   * @memberof QualityAlertListQueuedComponent
   */
  public deleteAll(): void {
    const alertList: string[] = map(this.filteredQualityAlerts, alert => alert.alertId);
    this.qualityAlertFacade.discardQualityAlerts(this.view, alertList);
  }

  /**
   * Delete one grouped alert
   *
   * @memberof QualityAlertListQueuedComponent
   */
  public deleteOne(): void {
    const alertList: string[] = [this.filteredQualityAlerts[this.activeIndex].alertId];
    this.qualityAlertFacade.discardQualityAlerts(this.view, alertList);
  }

  /**
   * Discard all changes modal
   *
   * @param {string} type
   * @return {void}
   * @memberof QualityAlertListQueuedComponent
   */
  public discard(type: string): void {
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
        type === 'single' ? this.deleteOne() : this.deleteAll();
      }
    });
  }

  /**
   * Accordion pagination event
   *
   * @param {PageEvent} event
   * @return {void}
   * @memberof QualityAlertAccordionComponent
   */
  public pageChangeEvent(event: PageEvent): void {
    const offset = (event.pageIndex + 1 - 1) * event.pageSize;
    this.filteredQualityAlerts = this.qualityAlerts.slice(offset).slice(0, event.pageSize);
  }

  /**
   * Distributed alerts filter
   *
   * @private
   * @param {{ type: string }} data
   * @return {void}
   * @memberof QualityAlertAccordionComponent
   */
  private setDistributedAlerts(data: { type: string }): void {
    this.qualityAlerts =
      data.type === 'Queued'
        ? this.fullAlerts.filter(alert => isEmpty(alert.relatedId))
        : this.fullAlerts.filter(alert => !isEmpty(alert.relatedId));
    this.pageLength = this.qualityAlerts.length;
    this.filteredQualityAlerts = this.qualityAlerts.slice((0 + 1 - 1) * this.pageSize).slice(0, this.pageSize);
  }
}
