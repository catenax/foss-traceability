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
import Objects from "../../modules/mapper/Objects";
import Strings from "../../modules/mapper/Strings";
import Response from "../../modules/response/Response";

/**
 * Browse quality alert by given query action
 * @param req
 * @param res
 * @param next
 * @constructor
 *
 */
export default async function Browse(req: any, res: any, next: any) {
  const client = new QualityAlertMgmtClient();
  if (!req.body.hasOwnProperty("filter")) {
    return Response.json(res, Response.errorPayload(`Request body is missing filter key`), 400);
  }
  const filter = req.body.filter;
  const jwt = JWT.parseFromHeader(req.header("Authorization"));
  return client
    .getAllQualityAlert(filter, JWT.parseMspIDFromToken(jwt))
    .then((response: any) =>
      Response.json(
        res,
        response.map((tx: any) => Objects.mapKeys(tx.toJSON(), Strings.snakeCaseToCamelCase)),
        200,
      ),
    )
    .catch((error: any) => {
      return Response.json(res, Response.errorObject(Response.errorPayload(error), Response.errorStatusCode(error)));
    });
}
/**
 * @ignore
 * @swagger
 * /v1/quality-alert/browse-alert:
 *   post:
 *     security:
 *       - Bearer: []
 *     description: Query quality alert from the database by given filters
 *     tags: ['quality-alert']
 *     parameters:
 *       - name: filter
 *         description: Filter for alerts
 *         in: body
 *         required: true
 *         type: object
 *         items:
 *          $ref: '#/definitions/alertfilter'
 *     responses:
 *       200:
 *         description:  List of objects matched by given filters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/qualityAlert'
 */
