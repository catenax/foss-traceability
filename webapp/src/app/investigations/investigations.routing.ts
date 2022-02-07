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
import { RouterModule, Routes } from '@angular/router';
import { AssetDetailContainerComponent } from '../assets/presentation/asset-detail-container/asset-detail-container.component';
import { MspidsResolver } from '../shared/resolver/mspids.resolver';
import { InvestigationDetailWrapperComponent } from './presentation/investigation-detail/investigation-detail-wrapper';
import { InvestigationDetailComponent } from './presentation/investigation-detail/investigation-detail.component';
import { InvestigationsComponent } from './presentation/investigations.component';
import { InvestigationsResolver } from './resolver/investigations.resolver';

export /** @type {*} */
const investigationsRouting: Routes = [
  { path: '', pathMatch: 'full', component: InvestigationsComponent },
  {
    path: ':id',
    component: InvestigationDetailWrapperComponent,
    data: { breadcrumb: '' },
    resolve: [InvestigationsResolver, MspidsResolver],
    children: [
      {
        path: '',
        component: InvestigationDetailComponent,
        data: { breadcrumb: '' },
      },
      {
        path: ':part',
        component: AssetDetailContainerComponent,
        data: { breadcrumb: '' },
      },
    ],
  },
];

/**
 *
 *
 * @export
 * @class InvestigationsRouting
 */
@NgModule({
  imports: [RouterModule.forChild(investigationsRouting)],
  exports: [RouterModule],
  providers: [InvestigationsResolver],
})
export class InvestigationsRouting {}
