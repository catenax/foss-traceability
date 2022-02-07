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

import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

/**
 *
 *
 * @export
 * @class AssetSearchComponent
 * @implements {AfterViewInit}
 */
@Component({
  selector: 'app-asset-search',
  templateUrl: './asset-search.component.html',
  styleUrls: ['./asset-search.component.scss'],
})
export class AssetSearchComponent implements AfterViewInit {
  /**
   * Serial number searched
   *
   * @type {ElementRef}
   * @memberof AssetSearchComponent
   */
  @ViewChild('serialNumber', { read: ElementRef, static: true })
  serialNumber: ElementRef;

  /**
   * Page title
   *
   * @type {string}
   * @memberof AssetSearchComponent
   */
  public title = 'Find Part';

  /**
   * Serial number to shared down the child component
   *
   * @type {string}
   * @memberof AssetSearchComponent
   */
  public serialNumberSubscribed: string;

  /**
   * Angular lifecycle method - After View Init
   * Event search subscription
   *
   * @return {void}
   * @memberof AssetSearchComponent
   */
  ngAfterViewInit(): void {
    fromEvent(this.serialNumber.nativeElement, 'keyup')
      .pipe(
        map((event: KeyboardEvent) => {
          return (event.target as HTMLInputElement).value;
        }),
        filter(value => value.length > 2),
        debounceTime(1000),
        distinctUntilChanged(),
      )
      .subscribe((serialNumberCustomer: string) => {
        this.serialNumberSubscribed = serialNumberCustomer;
      });
  }
}
