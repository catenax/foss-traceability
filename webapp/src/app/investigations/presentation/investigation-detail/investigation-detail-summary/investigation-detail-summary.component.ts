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

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { QualityInvestigation } from 'src/app/investigations/model/quality-investigation.model';

/**
 *
 *
 * @export
 * @class InvestigationDetailSummaryComponent
 */
@Component({
  selector: 'app-investigation-detail-summary',
  templateUrl: './investigation-detail-summary.component.html',
  styleUrls: ['./investigation-detail-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestigationDetailSummaryComponent {
  /**
   * Quality investigation detail
   *
   * @type {Investigation}
   * @memberof InvestigationDetailSummaryComponent
   */
  @Input() investigation: QualityInvestigation;

  /**
   * Quality investigation status
   *
   * @type {Observable<string>}
   * @memberof InvestigationDetailSummaryComponent
   */
  @Input() status$: Observable<string>;
}
