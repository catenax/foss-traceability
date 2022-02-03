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

import JWT from "./../../modules/jwt/JWT";
import Response from "../../modules/response/Response";
import QualityAlertMgmtClient from "../../domains/QualityAlertMgmtClient";

import { AlertFlow } from "../../enums/QualityStatus";
/**
 * Consume quality alert
 * @param req
 * @param res
 * @param next
 * @constructor
 *
 */
export default async function ConsumeQualityAlert(req: any, res: any, next: any) {
  const client = new QualityAlertMgmtClient();
  const jwt = JWT.parseFromHeader(req.header("Authorization"));
  if (!req.body.hasOwnProperty("alertId")) {
    return Response.json(res, Response.errorPayload(`Request body is missing alertId key`), 400);
  }
  if (!req.body.hasOwnProperty("eventUID")) {
    return Response.json(res, Response.errorPayload(`Request body is missing eventUID key`), 400);
  }
  if (!req.body.hasOwnProperty("eventTimestamp")) {
    return Response.json(res, Response.errorPayload(`Request body is missing eventTimestamp key`), 400);
  }
  if (!req.body.hasOwnProperty("eventType")) {
    return Response.json(res, Response.errorPayload(`Request body is missing eventType key`), 400);
  }
  if (!req.body.hasOwnProperty("eventOriginApp")) {
    return Response.json(res, Response.errorPayload(`Request body is missing eventOriginApp key`), 400);
  }
  if (!req.body.hasOwnProperty("eventOriginCompany")) {
    return Response.json(res, Response.errorPayload(`Request body is missing eventOriginCompany key`), 400);
  }
  if (!req.body.hasOwnProperty("eventTargetCompany")) {
    return Response.json(res, Response.errorPayload(`Request body is missing eventTargetCompany key`), 400);
  }
  if (!req.body.hasOwnProperty("eventBody")) {
    return Response.json(res, Response.errorPayload(`Request body is missing eventBody key`), 400);
  }
  if (!req.body.hasOwnProperty("eventFlow")) {
    return Response.json(res, Response.errorPayload(`Request body is missing eventFlow key`), 400);
  }

  const {
    eventUID,
    eventTimestamp,
    eventType,
    eventOriginApp,
    eventOriginCompany,
    eventTargetCompany,
    eventBody,
    eventFlow,
    alertId,
    originPartnerName,
  } = req.body;

  let acceptedEventFlow = Object.values(AlertFlow);

  if (acceptedEventFlow.indexOf(eventFlow) == -1) {
    return Response.json(res, Response.errorPayload(`eventFlow ${eventFlow} is not valid. Valid qualityTypes are ${acceptedEventFlow}`), 400);
  }

  //TODO: do the validation for the comments
  let comments = req.body.hasOwnProperty("comments") ? req.body.comments[0].message : "";
  return client
    .consumeQualityAlert(
      eventUID,
      alertId,
      eventTimestamp,
      eventOriginApp,
      eventOriginCompany,
      eventTargetCompany,
      eventType,
      eventBody,
      comments,
      eventFlow,
      JWT.parseMspIDFromToken(jwt),
      originPartnerName,
    )
    .then((response: any) => {
      Response.json(res, response.data, response.status);
    })
    .catch((error: any) => Response.json(res, Response.errorPayload(error), Response.errorStatusCode(error)));
}
/**
 * @ignore
 * @swagger
 * /v1/quality-alert/consume:
 *   post:
 *     security:
 *       - Bearer: []
 *     description: Consume a quality alert from external
 *     tags: ['quality-alert']
 *     parameters:
 *       - name: eventUID
 *         description:  Should be unique
 *         type: string
 *       - name: eventTimestamp
 *         description:  Creation date and time
 *         required: true
 *         type: string
 *         format: date-time
 *       - name: eventOrigin
 *         description:  description of the event origin (e. g. companyOneID, AppID)
 *         in: body
 *         required: true
 *         type: string
 *       - name: eventOriginCompany
 *         description:   OneID of emitting Business Partner
 *         in: body
 *         required: true
 *         type: string
 *       - name: eventTargetCompany
 *         description:   OneID of receiving Business Partner
 *         in: body
 *         required: true
 *         type: string
 *       - name: eventType
 *         description:  event type specification
 *         in: body
 *         required: true
 *         type: array
 *         schema:
 *           items:
 *             type: string
 *       - name: eventBody
 *         description:  event body specification
 *         in: body
 *         required: true
 *         type: array
 *         schema:
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/createAlert'
 */
