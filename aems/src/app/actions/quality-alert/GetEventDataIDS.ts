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

import QualityAlertMgmtClient from "../../domains/QualityAlertMgmtClient";
import JWT from "./../../modules/jwt/JWT";
import Response from "../../modules/response/Response";

/**
 * Get data for IDS connector
 * @param req
 * @param res
 * @param next
 * @constructor
 *
 */
export default async function GetIdsEvents(req: any, res: any, next: any) {
  const client = new QualityAlertMgmtClient();
  const jwt = JWT.parseFromHeader(req.header("Authorization"));
  if (!req.body.hasOwnProperty("eventTargetCompany")) {
    return Response.json(res, Response.errorPayload(`Request body is missing eventTargetCompany key`), 400);
  }

  const { eventTargetCompany } = req.body;

  return client
    .getIDSEventData(JWT.parseMspIDFromToken(jwt), eventTargetCompany)
    .then((response: any) => {
      return Response.json(res, Response.successObject(JSON.parse(response.data), response.status), response.status);
    })
    .catch((error: any) => {
      return Response.json(res, Response.errorObject(Response.errorPayload(error), Response.errorStatusCode(error)));
    });
}
/**
 * @ignore
 * @swagger
 * /v1/quality-alert/events:
 *   put:
 *     security:
 *       - Bearer: []
 *     description: Gets all the events for the eventTargetCompany with status notified_ids
 *     tags: ['quality-alert']
 *     parameters:
 *       - name: eventTargetCompany
 *         description: CustomerOneID of the target company for getting the events
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description:  List of objects matched by given filters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/idsEventData'
 */
