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

import { AlertFlow } from "../../enums/QualityStatus";
/**
 * Commit quality alert action
 * @param req
 * @param res
 * @param next
 * @constructor
 */

export default async function Commit(req: any, res: any, next: any) {
  const client = new QualityAlertMgmtClient();

  if (!req.body.hasOwnProperty("alertIDs")) {
    return Response.json(res, Response.errorPayload(`Request is missing key alertIDs`), 400);
  }

  const { alertIDs } = req.body;

  return client
    .commitQualityAlert(alertIDs, JWT.parseMspIDFromToken(JWT.parseFromHeader(req.header("Authorization"))))
    .then((response: any) => {
      return Response.json(res, Response.successObject(response.data, response.status), 200);
    })
    .catch((error: any) => {
      return Response.json(res, Response.errorObject(Response.errorPayload(error), Response.errorStatusCode(error)), Response.errorStatusCode(error));
    });
}
/**
 * @ignore
 * @swagger
 * /v1/quality-alert/commit:
 *   post:
 *     security:
 *       - Bearer: []
 *     description: Query quality-alerts from the database by given filters
 *     tags: ['quality-alert']
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: alertIDs
 *         description: AlertIDs to commit
 *         in:  body
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
 *               $ref: '#/definitions/updateAlert'
 */
