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

import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { InvestigationsFacade } from '../abstraction/investigations.facade';
import { QualityInvestigation } from '../model/quality-investigation.model';

/**
 *
 *
 * @export
 * @class InvestigationsResolver
 * @implements {Resolve<View<QualityInvestigation[]>>}
 */
@Injectable()
export class InvestigationsResolver implements Resolve<QualityInvestigation[]> {
  /**
   * @constructor InvestigationsResolver.
   * @param {InvestigationsFacade} investigationsFacade
   * @memberof InvestigationsResolver
   */
  constructor(private investigationsFacade: InvestigationsFacade) {}

  /**
   * Resolve the request before switching pages
   *
   * @return {(QualityInvestigation[] | Observable<QualityInvestigation[]> | Promise<QualityInvestigation[]>)}
   * @memberof InvestigationsResolver
   */
  resolve(): QualityInvestigation[] | Observable<QualityInvestigation[]> | Promise<QualityInvestigation[]> {
    const investigations = this.investigationsFacade.investigationsSnapshot;
    return investigations && investigations.length ? investigations : this.investigationsFacade.getInvestigations();
  }
}
