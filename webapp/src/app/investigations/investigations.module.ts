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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { TemplateModule } from '../shared/template.module';
import { InvestigationsComponent } from './presentation/investigations.component';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { icons } from './../shared/shared-icons.module';
import { InvestigationsFacade } from './abstraction/investigations.facade';
import { InvestigationsState } from './core/investigations.state';
import { InvestigationsService } from './core/investigations.service';
import { InvestigationsRouting } from './investigations.routing';
import { InvestigationsListComponent } from './presentation/investigations-list/investigations-list.component';
import { InvestigationsEmptyStateComponent } from './presentation/investigations-empty-state/investigations-empty-state.component';
import { InvestigationDetailComponent } from './presentation/investigation-detail/investigation-detail.component';
import { FilterPipe } from './pipes/filter.pipe';
import { InvestigationDetailSummaryComponent } from './presentation/investigation-detail/investigation-detail-summary/investigation-detail-summary.component';
import { ReceivedComponent } from './presentation/investigations-list/received/received.component';
import { QueuedComponent } from './presentation/investigations-list/queued/queued.component';
import { RequestedComponent } from './presentation/investigations-list/requested/requested.component';
import { InvestigationLoadingStateComponent } from './presentation/investigation-loading-state/investigation-loading-state.component';
import { InvestigationCreateComponent } from './presentation/investigation-create/investigation-create.component';
import { InvestigationDetailWrapperComponent } from './presentation/investigation-detail/investigation-detail-wrapper';
import { InvestigationsRaiseAlertComponent } from './presentation/investigations-raise-alert/investigations-raise-alert.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

/**
 *
 *
 * @export
 * @class InvestigationsModule
 */
@NgModule({
  declarations: [
    InvestigationsComponent,
    InvestigationsListComponent,
    InvestigationsEmptyStateComponent,
    InvestigationDetailComponent,
    FilterPipe,
    InvestigationDetailSummaryComponent,
    ReceivedComponent,
    QueuedComponent,
    RequestedComponent,
    InvestigationLoadingStateComponent,
    InvestigationCreateComponent,
    InvestigationDetailWrapperComponent,
    InvestigationsRaiseAlertComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    TemplateModule,
    SvgIconsModule.forChild(icons),
    InvestigationsRouting,
    NgxDaterangepickerMd.forRoot(),
  ],
  providers: [InvestigationsService, InvestigationsFacade, InvestigationsState],
})
export class InvestigationsModule {}
