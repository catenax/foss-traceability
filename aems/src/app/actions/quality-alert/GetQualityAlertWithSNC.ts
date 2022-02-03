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
import Objects from "../../modules/mapper/Objects";
import Strings from "../../modules/mapper/Strings";

/**
 *
 * @param req
 * @param res
 * @param next
 * @constructor
 */

export default async function getQualityAlert(req: any, res: any, next: any) {
  const client = new QualityAlertMgmtClient();
  const jwt = JWT.parseFromHeader(req.header("Authorization"));

  if (!req.query.hasOwnProperty("serialNumberCustomer")) {
    return Response.json(res, Response.errorPayload(`Request is missing key serialNumberCustomer`), 400);
  }
  let serialNumberCustomer: string = decodeURIComponent(req.query.serialNumberCustomer);
  return client
    .getQualityAlertDetails(serialNumberCustomer, JWT.parseMspIDFromToken(jwt))
    .then((response: any) =>
      Response.json(
        res,
        response.map((tx: any) => Objects.mapKeys(tx.toJSON(), Strings.snakeCaseToCamelCase)),
        200,
      ),
    )
    .catch((error: any) => Response.json(res, Response.errorPayload(error), Response.errorStatusCode(error)));
}
/**
 * @ignore
 * @swagger
 * /v1/quality-alert/snc:
 *   get:
 *     security:
 *       - Bearer: []
 *     description: Gets the quality alert of a specific asset
 *     tags: ['quality-alert']
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: serialNumberCustomer
 *         description: Serial Number Customer
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
 *                 $ref: '#/definitions/qualityAlert'
 *
 */
