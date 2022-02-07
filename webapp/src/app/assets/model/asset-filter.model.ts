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

import { FormGroup } from '@angular/forms';

/**
 * @interface AssetFilter
 */
export interface AssetFilter {
  serialNumberManufacturer?: { value: string };
  serialNumberCustomerList?: { value: string | string[] };
  type?: { value: string };
  manufacturer?: { value: string; regex?: boolean };
  productionCountryCode?: { value: string; regex?: boolean };
  partNameNumber?: { value: string; regex?: boolean };
  productionDateFrom?: { value: string };
  productionDateTo?: { value: string };
  qualityStatus?: { value: string };
  manufacturerLine?: { value: string };
  manufacturerPlant?: { value: string };
  serialNumberType?: { value: string };
  mspid?: { value: string };
  partNumberCustomer?: { value: string };
}

/**
 * @interface Filter
 */
export interface Filter {
  cb: () => void;
  clear: () => void;
  form: FormGroup;
  type: string;
}
