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

import route, {getRouteOptions} from "../modules/route/route";
import getAsset from "../actions/offHLFDB/GetAsset";
import getChildren from "../actions/offHLFDB/GetChildren";
import getParent from "../actions/offHLFDB/GetParent";
import getAssets from "../actions/offHLFDB/GetAssets";


/**
 * Get asset data route
 */
 const getAssetData = route(':serialNumberCustomer', getAsset, getRouteOptions("get"));

 
/**
 * Get asset children data route
 */
 const getAssetChildren = route(':serialNumberCustomer/child', getChildren, getRouteOptions("get"));


/**
 * Get asset parent data route
 */
 const getAssetParent = route(':serialNumberCustomer/parent', getParent, getRouteOptions("get"));



 const getAssetList = route('/', getAssets, getRouteOptions("get"));


/**
 * OffChainDBClient API router
 * @export object
 */
export default {
    pathPrefix: 'v1/asset',
    data: [
        getAssetList,
        getAssetData,
        getAssetChildren,
        getAssetParent
    ]
}
