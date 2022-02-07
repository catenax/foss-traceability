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

import { Pipe, PipeTransform } from '@angular/core';
import { Mspid } from 'src/app/shared/model/mspid.model';

/**
 *
 *
 * @export
 * @class FilterPipe
 * @implements {PipeTransform}
 */
@Pipe({ name: 'appFilter' })
export class FilterPipe implements PipeTransform {
  /**
   * Filter mspid
   *
   * @param {Mspid[]} items
   * @param {string} searchedText
   * @return {Mspid[]}
   * @memberof FilterPipe
   */
  transform(items: Mspid[], searchedText: string): Mspid[] {
    if (!items) {
      return [];
    }
    if (!searchedText) {
      return items;
    }

    return items.filter((item: Mspid) => item.name.toLocaleLowerCase().includes(searchedText.toLocaleLowerCase()));
  }
}
