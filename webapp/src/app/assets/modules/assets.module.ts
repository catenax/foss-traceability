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
import { AssetsListComponent } from '../presentation/assets-list/assets-list.component';
import { SkeletonTableComponent } from '../presentation/assets-list/skeleton-table/skeleton-table.component';
import { PaginationComponent } from '../presentation/assets-list/pagination/pagination.component';
import { TableEmptyStateComponent } from '../presentation/assets-list/table-empty-state/table-empty-state.component';
import { TemplateModule } from '../../shared/template.module';
import { SharedModule } from '../../shared/shared.module';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { icons } from '../../shared/shared-icons.module';
import { AssetsListFacade } from '../abstraction/assets-list.facade';
import { AssetsListState } from '../core/assets-list.state';
import { AssetsListService } from '../core/assets-list.service';
import { AssetDetailContainerComponent } from '../presentation/asset-detail-container/asset-detail-container.component';

/**
 *
 *
 * @export
 * @class AssetsModule
 */
@NgModule({
  declarations: [
    AssetsListComponent,
    SkeletonTableComponent,
    PaginationComponent,
    TableEmptyStateComponent,
    AssetDetailContainerComponent,
  ],
  imports: [CommonModule, SharedModule, TemplateModule, SvgIconsModule.forChild(icons)],
  exports: [
    AssetsListComponent,
    SkeletonTableComponent,
    PaginationComponent,
    TableEmptyStateComponent,
    AssetDetailContainerComponent,
  ],
  providers: [AssetsListFacade, AssetsListState, AssetsListService],
})
export class AssetsModule {}
