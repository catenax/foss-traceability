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
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { KeycloakService, KeycloakAuthGuard } from 'keycloak-angular';
import { SharedService } from 'src/app/shared/core/shared.service';

/**
 *
 *
 * @export
 * @class AuthGuard
 * @extends {KeycloakAuthGuard}
 */
@Injectable()
export class AuthGuard extends KeycloakAuthGuard {
  /**
   * @constructor AuthGuard
   * @param {Router} router
   * @param {KeycloakService} keycloakService
   * @memberof AuthGuard
   */
  constructor(
    protected router: Router,
    protected keycloakService: KeycloakService,
    protected sharedService: SharedService,
  ) {
    super(router, keycloakService);
  }

  /**
   * Keycloak authentication guard
   *
   * @param {ActivatedRouteSnapshot} route
   * @return {Promise<boolean>}
   * @memberof AuthGuard
   */
  public async isAccessAllowed(route: ActivatedRouteSnapshot): Promise<boolean> {
    if (!this.authenticated) {
      await this.keycloakService.login().then();
    }

    // Get the roles required from the route.
    const requiredRoles = route.data.roles;

    // Allow the user to to proceed if no additional roles are required to access the route.
    if (!(requiredRoles instanceof Array) || requiredRoles.length === 0) {
      return true;
    }

    // Allow the user to proceed if all the required roles are present.
    return requiredRoles.every(role => this.roles.includes(role));
  }
}
