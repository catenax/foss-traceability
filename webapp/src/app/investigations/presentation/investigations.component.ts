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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LayoutFacade } from 'src/app/shared/abstraction/layout-facade';
import { View } from 'src/app/shared/model/view.model';
import { InvestigationsFacade } from '../abstraction/investigations.facade';
import { QualityInvestigation } from '../model/quality-investigation.model';

/**
 *
 *
 * @export
 * @class InvestigationsComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-investigations',
  templateUrl: './investigations.component.html',
  styleUrls: ['./investigations.component.scss'],
})
export class InvestigationsComponent implements OnInit {
  /**
   * Investigations state
   *
   * @type {Observable<View<Investigation[]>>}
   * @memberof InvestigationsComponent
   */
  public investigations$: Observable<View<QualityInvestigation[]>>;

  /**
   * @constructor InvestigationsComponent
   * @param {InvestigationsFacade} investigationsFacade
   * @param {LayoutFacade} layoutFacade
   * @param {Router} router
   * @param {ActivatedRoute} route
   * @memberof InvestigationsComponent
   */
  constructor(
    private investigationsFacade: InvestigationsFacade,
    private layoutFacade: LayoutFacade,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.investigations$ = this.investigationsFacade.investigations$;
  }

  /**
   * Angular lifecycle method - Ng on init
   *
   * @return {void}
   * @memberof InvestigationsComponent
   */
  ngOnInit(): void {
    this.investigationsFacade.setInvestigations();
  }

  /**
   * Navigate to detail's page
   *
   * @param {{ view: string; alertId: string }} view
   * @return {void}
   * @memberof InvestigationsComponent
   */
  public viewDetails(view: { view: string; alertId: string }): void {
    const tab = view.view;
    const tabIndex = {
      received: 0,
      queued: 1,
      requested: 2,
    };

    this.layoutFacade.setTabIndex(tabIndex[tab]);

    localStorage.setItem('tabIndex', tabIndex[tab]);

    this.router.navigate([`${view.alertId}`], { relativeTo: this.route }).then();
  }

  /**
   * Commit quality investigation by id
   *
   * @param {{ view: string; alertId: string }} view
   * @return {void}
   * @memberof InvestigationsComponent
   */
  public commitQualityInvestigation(view: { view: string; alertId: string }): void {
    const { alertId } = view;
    this.investigationsFacade.commitQualityInvestigations([alertId]);
  }

  /**
   * Delete quality investigation by id
   *
   * @param {{ view: string; alertId: string }} view
   * @return {void}
   * @memberof InvestigationsComponent
   */
  public deleteQualityInvestigation(view: { view: string; alertId: string }): void {
    const { alertId } = view;
    this.investigationsFacade.deleteQualityInvestigation([alertId]);
  }
}
