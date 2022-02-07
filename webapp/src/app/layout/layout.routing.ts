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
import { Routes, RouterModule } from '@angular/router';
import { MspidsResolver } from '../shared/resolver/mspids.resolver';

export /** @type {*} */
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./../dashboard/dashboard.module').then(m => m.DashboardModule),
  },

  {
    path: 'dashboard',
    loadChildren: () => import('./../dashboard/dashboard.module').then(m => m.DashboardModule),
    data: { breadcrumb: 'Home' },
  },

  {
    path: 'about',
    loadChildren: () => import('./../about/about.module').then(m => m.AboutModule),
    data: { breadcrumb: 'About' },
  },

  {
    path: 'quality-alert',
    loadChildren: () => import('./../quality-alert/quality-alert.module').then(m => m.QualityAlertModule),
    data: { role: ['admin', 'quality_manager'], breadcrumb: 'Quality Alerts' },
  },

  {
    path: 'introduction',
    loadChildren: () => import('./../introduction/introduction.module').then(m => m.IntroductionModule),
    data: { breadcrumb: 'Introduction' },
  },

  {
    path: 'acl',
    loadChildren: () => import('./../acl/acl.module').then(m => m.AclModule),
    data: { role: ['admin'], breadcrumb: 'Access Control' },
  },

  {
    path: 'my-parts',
    loadChildren: () => import('../assets/modules/my-parts.module').then(m => m.MyPartsModule),
    data: { breadcrumb: 'My Parts' },
  },

  {
    path: 'supplier-parts',
    loadChildren: () => import('../assets/modules/supplier-parts.module').then(m => m.SupplierPartsModule),
    data: { breadcrumb: 'Other Parts' },
  },

  {
    path: 'find',
    loadChildren: () => import('./../asset-search/asset-search.module').then(m => m.AssetSearchModule),
    data: { breadcrumb: 'Find Part' },
  },

  {
    path: 'investigations',
    loadChildren: () => import('./../investigations/investigations.module').then(m => m.InvestigationsModule),
    data: { breadcrumb: 'Quality Investigations' },
    resolve: [MspidsResolver],
  },
];

/**
 *
 *
 * @export
 * @class LayoutRoutingModule
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutRoutingModule {}
