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

import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { TableFacade } from 'src/app/shared/components/table/table.facade';

@Component({
  selector: 'app-my-parts',
  templateUrl: './my-parts.component.html',
  styleUrls: ['./my-parts.component.scss'],
})
export class MyPartsComponent {
  /**
   * Selected asset state
   *
   * @type {Observable<string>}
   * @memberof AssetsListComponent
   */
  public selectedAsset$: Observable<string>;

  /**
   * @constructor MyPartsComponent
   * @param {TableFacade} tableFacade
   * @memberof MyPartsComponent
   */
  constructor(private tableFacade: TableFacade) {
    this.selectedAsset$ = this.tableFacade.selectedAsset$;
  }
}
