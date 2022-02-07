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

import Logger from "../logger/Logger";

//TODO: Remove  the mapping after Speedboat
export function getCustomerOneIDFromMSP(mspid: string): string{
    Logger.info(`getting CustomerOneID For MSP = ${mspid}`);

    switch (mspid) {
        case "BMW":
          return "CAXSWPFTJQEVZNZZ";
        case "TAAS-BILSTEIN":
          return "Partner_00002_BILSTEIN";
        case "TAAS-GRIS":
          return "CAXSJRTGOPVESVZZ";
        case "TAAS-ZF":
          return "CAXLTHAJNAHZXGZZ";
        case "TAAS-TIER1":
          return "Partner_00005_TIER1";
        case "TAAS-HENKEL":
          return "CAXLHNJURNRLPCZZ";
        case "TAAS-BASF":
          return "CAXLBRHHQAJAIOZZ";
        default:
          return "NotFound";
    }
}
