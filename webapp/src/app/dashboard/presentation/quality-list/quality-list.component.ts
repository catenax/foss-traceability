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

import { KeyValue } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { isEmpty } from 'lodash-es';
import { QualityAlertIcons, QualityTypes } from 'src/app/quality-alert/model/quality-alert.model';
import { DashTopAlerts, GroupedTopAlerts } from '../../model/top-alerts.model';

/**
 *
 *
 * @export
 * @class QualityListComponent
 * @implements {OnChanges}
 */
@Component({
  selector: 'app-quality-list',
  templateUrl: './quality-list.component.html',
  styleUrls: ['./quality-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QualityListComponent implements OnChanges {
  /**
   * Received alerts or investigations
   *
   * @type {GroupedAlert[]}
   * @memberof QualityListComponent
   */
  @Input() alerts: DashTopAlerts;

  /**
   * Is investigation view
   *
   * @type {boolean}
   * @memberof QualityListComponent
   */
  @Input() isInvestigation: boolean;

  /**
   * Page navigation emitter
   *
   * @type {EventEmitter<string>}
   * @memberof QualityListComponent
   */
  @Output() pageNavigation: EventEmitter<string> = new EventEmitter<string>();

  /**
   * Remaining alerts function to keep the object order
   *
   * @type {(a: { key: string; value: string }) => string}
   * @memberof QualityListComponent
   */
  public keepOriginalOrder: (a: KeyValue<string, string>, b: KeyValue<string, string>) => number;

  /**
   * Top 5 alerts
   *
   * @type {GroupedAlert[]}
   * @memberof QualityListComponent
   */
  public topFiveAlerts: GroupedTopAlerts[];

  /**
   * Remaining alerts
   *
   * @type {RemainingAlerts}
   * @memberof QualityListComponent
   */
  public remainingAlerts: ReadonlyMap<string, string>;

  /**
   * Angular lifecycle method - Ng on changes
   *
   * @param {SimpleChanges} changes
   * @memberof QualityListComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.alerts) {
      this.topFiveAlerts = changes.alerts.currentValue.topAlerts;
      this.remainingAlerts = changes.alerts.currentValue.remainingAlerts;
      this.keepOriginalOrder = (a: { key: string; value: string }) => +a.key;
    }
  }

  /**
   * Emit detail navigation
   *
   * @param {string} id
   * @return {void}
   * @memberof QualityListComponent
   */
  public emitNavigation(id: string): void {
    const view: string = this.isInvestigation ? `investigations/${id}` : `quality-alert/${id}`;
    this.pageNavigation.emit(view);
  }

  /**
   * Label for the empty state
   *
   * @return {string}
   * @memberof QualityListComponent
   */
  public emptyStateLabel(): string {
    const label: string = this.isInvestigation ? 'investigations' : 'alerts';
    return `You haven't received quality ${label}.`;
  }

  /**
   * Quality type icon color getter
   *
   * @param {({ key: string; value: number } | string)} qualityType
   * @return {string}
   * @memberof QualityListComponent
   */
  public getIconColor(qualityType: { key: string; value: number } | string): string {
    const key: string = typeof qualityType === 'object' ? qualityType.key : qualityType;
    return QualityTypes[key];
  }

  /**
   * Quality type icon getter
   *
   * @param {{ key: string; value: number }} type
   * @return {string}
   * @memberof QualityListComponent
   */
  public getIcon(type: KeyValue<string, string>): string {
    return QualityAlertIcons[type.key];
  }

  /**
   * Gets the card border and background
   *
   * @param {GroupedAlert} qualityAlert
   * @return {{
   *     'border-minor': boolean;
   *     'border-major': boolean;
   *     'border-critical': boolean;
   *     'border-threat': boolean;
   *     'border-investigation': boolean;
   *   }}
   * @memberof QualityListComponent
   */
  public getCardCssClass(
    qualityAlert: GroupedTopAlerts,
  ): {
    'border-minor': boolean;
    'border-major': boolean;
    'border-critical': boolean;
    'border-threat': boolean;
    'border-investigation': boolean;
  } {
    return {
      'border-minor': qualityAlert.qualityType === 'MINOR',
      'border-major': qualityAlert.qualityType === 'MAJOR',
      'border-critical': qualityAlert.qualityType === 'CRITICAL',
      'border-threat': qualityAlert.qualityType === 'LIFE_THREATENING',
      'border-investigation': this.isInvestigation,
    };
  }

  /**
   * Gets the card label depending if is an investigation or not
   *
   * @param {GroupedAlert} qualityAlert
   * @return {string}
   * @memberof QualityListComponent
   */
  public getCardLabel(qualityAlert: GroupedTopAlerts): string {
    const parts = `${qualityAlert.numberOfParts !== 1 ? 'parts' : 'part'}`;
    return this.isInvestigation
      ? `${qualityAlert.originPartnerName} requested a quality investigation on ${qualityAlert.numberOfParts} ${parts}`
      : `${qualityAlert.numberOfParts} ${parts} affected due to ${qualityAlert.qualityType} issue on ${qualityAlert.originPartnerName} parts`;
  }

  /**
   * Checks if remaining alerts are empty
   *
   * @param {Record<string,number>} value
   * @return {boolean}
   * @memberof QualityListComponent
   */
  public isEmpty(value: ReadonlyMap<string, string>): boolean {
    return value && isEmpty(value);
  }
}
