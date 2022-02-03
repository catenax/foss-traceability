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
 * Delete quality alert action
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export default async function Delete(req: any, res: any, next: any) {
  const client = new QualityAlertMgmtClient();
  const jwt = JWT.parseFromHeader(req.header("Authorization"));

  if (!req.body.hasOwnProperty("alertIDs")) {
    return Response.json(res, Response.errorPayload(`Request is missing key alertIDs`), 400);
  }

  const { alertIDs } = req.body;

  return client
    .deleteQualityAlert(alertIDs, JWT.parseMspIDFromToken(jwt))
    .then((response: any) => {
      return Response.json(res, response, response.status);
    })
    .catch((error: any) => {
      return Response.json(res, Response.errorObject(Response.errorPayload(error), Response.errorStatusCode(error)), Response.errorStatusCode(error));
    });
}
/**
 * @ignore
 * @swagger
 * /v1/quality-alert/alerts:
 *   put:
 *     security:
 *       - Bearer: []
 *     description: Cancels the quality alert of serialNumberCustomers
 *     tags: ['quality-alert']
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: alertIDs
 *         description: AlertIDs to cancel the update
 *         in:  body
 *         required: true
 *         type: array
 *         schema:
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description:  Status message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eventsDeleted:
 *                   type: number
 *                   description: Number of events deleted
 *                 alertsDeleted:
 *                   type: number
 *                   description: Number of alert deleted
 */
