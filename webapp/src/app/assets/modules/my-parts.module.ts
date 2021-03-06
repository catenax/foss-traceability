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
import { MyPartsRouting } from './my-parts.routing';
import { AssetsModule } from './assets.module';
import { MyPartsComponent } from '../presentation/my-parts/my-parts.component';
import { CommonModule } from '@angular/common';
import { icons } from 'src/app/shared/shared-icons.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { TemplateModule } from 'src/app/shared/template.module';

/**
 *
 *
 * @export
 * @class AssetsModule
 */
@NgModule({
  declarations: [MyPartsComponent],
  imports: [AssetsModule, MyPartsRouting, CommonModule, SharedModule, TemplateModule, SvgIconsModule.forChild(icons)],
})
export class MyPartsModule {}
