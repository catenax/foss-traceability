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

import { CommentBody } from "./Comment";
/**
 *
 *
 * @export
 * @interface Event
 */
export interface Event {
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
  createdat?: string;
  origin_partner_name: string;
}
/**
 *
 *
 * @export
 * @interface ExternalQualityAlert
 */
export interface ExternalQualityAlert {
  CustomerUniqueID: string;
  QualityType: string;
  QualityAlert: string;
  eventOriginCompany: string;
  eventTargetCompany: string;
}

/**
 *
 *
 * @export
 * @interface EventModel
 */
export interface EventModel {
  eventUID: string;
  eventOriginApp: string;
  eventTimestamp: string;
  eventOriginCompany: string;
  eventTargetCompany: string;
  alertId: string;
  eventType: string;
  eventFlow: string;
  eventStatus: string;
  relatedEvent: string;
  eventBody: EventBody[];
  comments: CommentBody[];
  originPartnerName: string;
}
/**
 *
 *
 * @interface QualityAlert
 */
interface qualityAlert {
  QualityAlert: string;
  QualityType: string;
}
/**
 *
 *
 * @export
 * @interface EventBody
 */
export interface EventBody {
  customerUniqueID: string;
  qualityAlert: qualityAlert;
}
