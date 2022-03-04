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

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment as dev } from 'src/environments/environment.dev';
import { environment as stage } from 'src/environments/environment.stage';
import { isDevMode } from '@angular/core';

export class ApiInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<string>, next: HttpHandler): Observable<HttpEvent<string>> {
    const env = isDevMode() ? dev : stage;
    let requestUrl = req.url;

    if (requestUrl.indexOf('@TAASLAAPI') !== -1) {
      requestUrl = requestUrl.replace('@TAASLAAPI', env.taasLaapi);
    }

    if (requestUrl.indexOf('@TAASAEMS') !== -1) {
      requestUrl = requestUrl.replace('@TAASAEMS', env.taasAems);
    }

    if (requestUrl.indexOf('@BMWAEMS') !== -1) {
      requestUrl = requestUrl.replace('@BMWAEMS', env.aems);
    }

    if (requestUrl.indexOf('@BMWLAAPI') !== -1) {
      requestUrl = requestUrl.replace('@BMWLAAPI', env.laapi);
    }

    req = req.clone({ url: requestUrl });

    return next.handle(req);
  }
}
