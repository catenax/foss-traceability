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

export default class Events {
  event_uid: string;
  alert_id: string;
  event_origin: string;
  event_origin_company: string;
  event_target_company: string;
  event_type: string;
  event_status: string;
  event_flow: string;
  event_relation: string;
  propagated: boolean;
  origin_partner_name: string;

  constructor(
    event_uid: string,
    alert_id: string,
    event_origin: string,
    event_origin_company: string,
    event_target_company: string,
    event_type: string,
    event_status: string,
    event_flow: string,
    event_relation: string,
    propagated: boolean,
    origin_partner_name: string,
  ) {
    this.event_uid = event_uid;
    this.alert_id = alert_id;
    this.event_origin = event_origin;
    this.event_origin_company = event_origin_company;
    this.event_target_company = event_target_company;
    this.event_type = event_type;
    this.event_status = event_status;
    this.event_flow = event_flow;
    this.event_relation = event_relation;
    this.propagated = propagated;
    this.origin_partner_name = origin_partner_name;
  }
}
