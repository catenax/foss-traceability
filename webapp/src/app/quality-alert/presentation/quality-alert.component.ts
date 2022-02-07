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

import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LayoutFacade } from 'src/app/shared/abstraction/layout-facade';
import { View } from 'src/app/shared/model/view.model';
import { QualityAlertFacade } from '../abstraction/quality-alert.facade';
import { GroupedAlert } from '../model/grouped-alerts.model';

/**
 *
 *
 * @export
 * @class QualityAlertComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-quality-alert',
  templateUrl: './quality-alert.component.html',
  styleUrls: ['./quality-alert.component.scss'],
})
export class QualityAlertComponent implements OnInit {
  /**
   * Quality alert state
   *
   * @type {Observable<View<GroupedAlert[]>>}
   * @memberof QualityAlertComponent
   */
  public qualityAlerts$: Observable<View<GroupedAlert[]>>;

  /**
   * @constructor QualityAlertComponent
   * @param {QualityAlertFacade} qualityAlertFacade
   * @param {LayoutFacade} layoutFacade
   * @memberof QualityAlertComponent
   */
  constructor(private qualityAlertFacade: QualityAlertFacade, public layoutFacade: LayoutFacade) {
    this.qualityAlerts$ = this.qualityAlertFacade.qualityAlerts$;
  }

  /**
   * Angular lifecycle method - ng on init
   *
   * @memberof QualityAlertComponent
   */
  ngOnInit(): void {
    this.qualityAlertFacade.setQualityAlerts();
  }
}
