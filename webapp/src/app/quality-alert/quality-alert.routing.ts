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
import { MspidsResolver } from '../shared/resolver/mspids.resolver';
import { QualityAlertDetailComponent } from './presentation/quality-alert-detail/quality-alert-detail.component';
import { QualityAlertComponent } from './presentation/quality-alert.component';
import { QualityAlertResolver } from './resolver/quality-alert.resolver';

/** @type {*} */
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: QualityAlertComponent,
  },
  {
    path: ':id',
    component: QualityAlertDetailComponent,
    data: { breadcrumb: '' },
    resolve: [MspidsResolver, QualityAlertResolver],
  },
];

/**
 *
 *
 * @export
 * @class QualityAlertRoutingModule
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QualityAlertRoutingModule {}
