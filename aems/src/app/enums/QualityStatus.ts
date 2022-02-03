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
 * @enum {number}
 */
export enum QualityAlertStatus {
  CREATED = "created",
  PENDING = "pending",
  REJECTED = "rejected",
  COMMITTED = "committed",
  CANCELED = "canceled",
  FAILED = "failed",
  EXTERNAL = "external",
  DISTRIBUTED = "distributed",
  REVIEW = "review",
}

/**
 *
 *
 * @export
 * @enum {number}
 */
export enum EventStatus {
  PENDING = "pending",
  REJECTED = "rejected",
  COMMITTED = "committed",
  CANCELED = "canceled",
  EXTERNAL = "external",
  DISTRIBUTED = "distributed",
  EVENT_EXTERNAL_NOTIFY_IDS = "notified_ids",
  EVENT_EXTERNAL_SEND_IDS = "send_data_to_ids",
}

/**
 *
 *
 * @export
 * @enum {number}
 */
export enum QualityAlertType {
  LIFE_THREATENING = "LIFE-THREATENING",
  MAJOR = "MAJOR",
  MINOR = "MINOR",
  CRITICAL = "CRITICAL",
  QUESTIONABLE = "QUESTIONABLE",
  DEFAULT = "",
}

/**
 *
 *
 * @export
 * @enum {number}
 */
export enum AlertFlow {
  BOTTOM_UP = "BOTTOM-UP",
  TOP_DOWN = "TOP-DOWN",
}

export enum AlertHistoryStatus {
  CREATED = "CREATED",
  FORWARDED = "FORWARDED",
  DELETED = "DELETED",
}
