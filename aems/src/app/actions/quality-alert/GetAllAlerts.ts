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
 * Get all quality alert details
 * @param req
 * @param res
 * @param next
 * @constructor
 *
 */
export default async function allQualityAlert(req: any, res: any, next: any) {
  const client = new QualityAlertMgmtClient();

  const filter = Object.create({});
  if (req.query.hasOwnProperty("alertId")) {
    filter.alert_id = decodeURIComponent(req.query.alertId);
  }
  const jwt = JWT.parseFromHeader(req.header("Authorization"));
  return client
    .getAllAlerts(filter, JWT.parseMspIDFromToken(jwt))
    .then((response: any) => {
      Response.json(res, JSON.parse(response.data), response.status);
    })
    .catch((error: any) => {
      return Response.json(res, Response.errorObject(Response.errorPayload(error), Response.errorStatusCode(error)));
    });
}
/**
 * @ignore
 * @swagger
 * /v1/quality-alert/:
 *   get:
 *     security:
 *       - Bearer: []
 *     description: Query quality alert from the database by given filters
 *     tags: ['quality-alert']
 *     parameters:
 *       - in: query
 *         name: alertId
 *         description: alertId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description:  List of objects matched by given filters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/getAllQualityAlert'
 */
