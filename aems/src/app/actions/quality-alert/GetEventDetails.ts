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

import JWT from "../../modules/jwt/JWT";
import Response from "../../modules/response/Response";
import QualityAlertMgmtClient from "../../domains/QualityAlertMgmtClient";
/**
 *
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export default async function getEvent(req: any, res: any, next: any) {
  const client = new QualityAlertMgmtClient();
  const jwt = JWT.parseFromHeader(req.header("Authorization"));
  if (!req.query.hasOwnProperty("eventUID")) {
    return Response.json(res, Response.errorPayload(`Request is missing key eventUID`), 400);
  }
  let alertID: string = decodeURIComponent(req.query.eventUID);

  return client
    .getEventDetails(alertID, JWT.parseMspIDFromToken(jwt))
    .then((response: any) => {
      return Response.json(res, Response.successObject(JSON.parse(response.data), response.status), 200);
    })
    .catch((error: any) => {
      return Response.json(res, Response.errorObject(Response.errorPayload(error), Response.errorStatusCode(error)), Response.errorStatusCode(error));
    });
}
/**
 * @ignore
 * @swagger
 * /v1/quality-alert/events:
 *   get:
 *     security:
 *       - Bearer: []
 *     description: Gets the quality alert of a specific asset
 *     tags: ['quality-alert']
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: eventUID
 *         description: event UID
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerOneID
 *         description: customerOneID
 *         schema:
 *           type: string
 *       - in: query
 *         name: originCompanyOneID
 *         description: originCompanyOneID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/idsEventData'
 *
 */
