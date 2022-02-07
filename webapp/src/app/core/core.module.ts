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
import { ApiService } from './api/api.service';
import { UserService } from './user/user.service';
import { AuthService } from './auth/auth.service';
import { CanDeactivateGuard } from './user/can-deactivate.guard';

/**
 *
 *
 * @export
 * @class CoreModule
 */
@NgModule({
  providers: [ApiService, AuthService, UserService, CanDeactivateGuard],
})
export class CoreModule {}