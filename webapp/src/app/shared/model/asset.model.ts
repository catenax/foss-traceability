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

/**
 *
 *
 * @export
 * @interface CustomField
 */
export interface CustomField {
  field: string;
  value: string;
}

/**
 *
 *
 * @export
 * @interface Asset
 */
export interface Asset {
  manufacturer: string;
  productionCountryCodeManufacturer: string;
  partNameManufacturer: string;
  partNumberManufacturer?: string;
  partNumberCustomer?: string;
  serialNumberManufacturer: string;
  serialNumberCustomer?: string;
  qualityStatus: string;
  status: string;
  productionDateGmt: string;
  childComponents?: Asset[];
  componentsSerialNumbers?: string[];
  icon?: string;
  partIcon?: string;
  statusIcon?: { status: string; icon: string };
  partsAvailable?: string;
  parents?: Asset[];
  isParentKnown?: boolean;
  mspid: string;
  manufacturerLine?: string;
  manufacturerPlant?: string;
  serialNumberType: string;
  parentSerialNumberManufacturer?: string;
  isAffected?: string;
  qualityType?: string;
  customercontractoneid?: string;
  customeroneid?: string;
  customeruniqueid?: string;
  manufacturercontractoneid?: string;
  manufactureroneid?: string;
  manufactureruniqueid?: string;
  partnamecustomer?: string;
  productioncountrycode?: string;
  qualityalert?: string;
  businesspartnername?: string;
  businesspartnerplantname?: string;
  customerpartnername?: string;
  customFields?: Record<string, string>;
}

/**
 *
 *
 * @export
 * @interface AssetResponse
 */
export interface AssetResponse {
  data: Asset;
  status: number;
}
