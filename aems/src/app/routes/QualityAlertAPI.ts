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

import Create from "./../actions/quality-alert/CreateQualityAlert";
import Delete from "./../actions/quality-alert/Delete";
import route, { getRouteOptions } from "./../modules/route/route";
import Browse from "../actions/quality-alert/GetAllQualityAlert";
import EventBrowse from "../actions/quality-alert/GetAllEvents";
import GetQualityAlertWithSNC from "../actions/quality-alert/GetQualityAlertWithSNC";
import GetQualityAlertDetailWIthAlertID from "../actions/quality-alert/GetQualityAlertWithAlertID";
import Update from "../actions/quality-alert/UpdateQualityAlert";
import Commit from "../actions/quality-alert/Commit";
import Consume from "../actions/quality-alert/ConsumeAlert";
//import Event from "../actions/quality-alert/GetEventDetails";
import IDSEvent from "../actions/quality-alert/GetEventDataIDS";
import QualityAlert from "../actions/quality-alert/GetAllAlerts";

/**
 * Global options for all routes
 */

/**
 * Browse route
 */
const browse = route("browse-alert", Browse, getRouteOptions("post"));

/**
 * Browse events route
 */
const eventBrowse = route("events", EventBrowse, getRouteOptions("get"));

/**
 * get specific events route
 */
//const events = route("events", Event, getRouteOptions("get"));
/**
 * Commit route
 */
const commit = route("commit", Commit, getRouteOptions("post"));

/**
 * Consume route
 */
const consume = route("consume", Consume, getRouteOptions("post"));

/**
 * Get data for IDS connector
 */
const ids = route("events", IDSEvent, getRouteOptions("put"));

/**
 * Get quality alert details with SerialNumberCustomer
 */
const getQualityAlertWithSNC = route("snc", GetQualityAlertWithSNC, getRouteOptions("get"));

/**
 * Get quality alert details with AlertID
 */
const getQualityAlertWithAlertID = route("alertid", GetQualityAlertDetailWIthAlertID, getRouteOptions("get"));

/**
 * Create  quality alert
 */
const create = route("create", Create, getRouteOptions("post"));

/**
 * Update  quality alert
 */
const update = route("update", Update, getRouteOptions("post"));

/**
 * Remove route
 */
const remove = route("alerts", Delete, getRouteOptions("put"));
/**
 * Get all details of the quality alert
 */
const allQualityAlert = route("/", QualityAlert, getRouteOptions("get"));
/**
 * Quality Alert API router
 * @export object
 */
export default {
  pathPrefix: "v1/quality-alert",
  data: [browse, create, getQualityAlertWithSNC, remove, getQualityAlertWithAlertID, update, commit, consume, eventBrowse, ids, allQualityAlert],
};
