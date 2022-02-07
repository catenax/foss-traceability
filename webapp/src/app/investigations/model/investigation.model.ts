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

import { QualityAlert } from 'src/app/quality-alert/model/quality-alert.model';

/**
 *
 *
 * @export
 * @interface History
 */
export interface History {
  alertId: string;
  alertHistoryOriginCompany: string;
  alertHistoryTargetCompany: string;
  alertHistoryType: string;
  timestamp: string;
}

/**
 *
 *
 * @export
 * @interface Comment
 */
export interface Comment {
  message: string;
  originCompany: string;
  targetCompany: string;
  company: string;
  timestamp: string;
}

/**
 *
 *
 * @export
 * @interface QualityAlertEvent
 */
export interface QualityAlertEvent {
  eventOriginCompany: string;
  eventTargetCompany: string;
  eventUid: string;
  eventFlow: string;
  propagated: boolean;
  originPartnerName?: string;
}

/**
 *
 *
 * @export
 * @interface Investigation
 */
export interface Investigation {
  alertID: string;
  partsAffected: QualityAlert[];
  events: QualityAlertEvent[];
  history: History[];
  comments: Comment[];
  status: string;
  alertFlow: string;
  relatedAlertID?: string;
}

/**
 *
 *
 * @export
 * @interface InvestigationResponse
 */
export interface InvestigationResponse {
  data: Investigation[];
  status: number;
}
