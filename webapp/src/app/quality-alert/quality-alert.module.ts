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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { icons } from '../shared/shared-icons.module';
import { SharedModule } from '../shared/shared.module';
import { TemplateModule } from '../shared/template.module';
import { QualityAlertFacade } from './abstraction/quality-alert.facade';
import { QualityAlertService } from './core/quality-alert.service';
import { QualityAlertComponent } from './presentation/quality-alert.component';
import { QualityAlertCreateComponent } from './presentation/quality-alert-create/quality-alert-create.component';
import { QualityAlertRoutingModule } from './quality-alert.routing';
import { QualityAlertListComponent } from './presentation/quality-alert-list/quality-alert-list.component';
import { QualityAlertState } from './core/quality-alert.state';
import { QualityAlertListQueuedComponent } from './presentation/quality-alert-list/quality-alert-list-queued/quality-alert-list-queued.component';
import { QualityAlertLoadingStateComponent } from './presentation/quality-alert-loading-state/quality-alert-loading-state.component';
import { QualityAlertListRaisedComponent } from './presentation/quality-alert-list/quality-alert-list-raised/quality-alert-list-raised.component';
import { QualityAlertListReceivedComponent } from './presentation/quality-alert-list/quality-alert-list-received/quality-alert-list-received.component';
import { QualityAlertDetailComponent } from './presentation/quality-alert-detail/quality-alert-detail.component';
import { QualityAlertDetailSummaryComponent } from './presentation/quality-alert-detail/quality-alert-detail-summary/quality-alert-detail-summary.component';
import { QualityAlertLoadingComponent } from './presentation/quality-alert-loading/quality-alert-loading.component';
import { QualityAlertUpdatePartsComponent } from './presentation/quality-alert-update-parts/quality-alert-update-parts.component';
import { QualityAlertEditTypeComponent } from './presentation/quality-alert-edit-type/quality-alert-edit-type.component';
import { QualityAlertListDistributedComponent } from './presentation/quality-alert-list/quality-alert-list-distributed/quality-alert-list-distributed.component';
import { QualityAlertResolver } from './resolver/quality-alert.resolver';

/**
 *
 *
 * @export
 * @class QualityAlertModule
 */
@NgModule({
  declarations: [
    QualityAlertComponent,
    QualityAlertCreateComponent,
    QualityAlertListComponent,
    QualityAlertListQueuedComponent,
    QualityAlertLoadingStateComponent,
    QualityAlertListRaisedComponent,
    QualityAlertListReceivedComponent,
    QualityAlertDetailComponent,
    QualityAlertDetailSummaryComponent,
    QualityAlertLoadingComponent,
    QualityAlertUpdatePartsComponent,
    QualityAlertEditTypeComponent,
    QualityAlertListDistributedComponent,
  ],
  imports: [QualityAlertRoutingModule, CommonModule, TemplateModule, SharedModule, SvgIconsModule.forChild(icons)],
  providers: [QualityAlertService, QualityAlertFacade, QualityAlertState, QualityAlertResolver],
})
export class QualityAlertModule {}
