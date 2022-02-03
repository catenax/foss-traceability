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
import { AlertFlow, QualityAlertType } from "../../enums/QualityStatus";
/**
 * Update quality alert
 * @param req
 * @param res
 * @param next
 * @constructor
 *
 */
export default async function UpdateQualityAlert(req: any, res: any, next: any) {
  const client = new QualityAlertMgmtClient();
  const jwt = JWT.parseFromHeader(req.header("Authorization"));

  if (!req.body.hasOwnProperty("alertID")) {
    return Response.json(res, Response.errorPayload(`Request body is missing alertID key`), 400);
  }
  if (!req.body.hasOwnProperty("qualityType")) {
    return Response.json(res, Response.errorPayload(`Request body is missing qualityType key`), 400);
  }
  if (!req.body.hasOwnProperty("serialNumberCustomerList")) {
    return Response.json(res, Response.errorPayload(`Request body is missing serialNumberCustomerList key`), 400);
  }
  if (!req.body.hasOwnProperty("qualityAlert")) {
    return Response.json(res, Response.errorPayload(`Request body is missing qualityAlert key`), 400);
  }

  const { alertID, serialNumberCustomerList, qualityType, qualityAlert } = req.body;

  let message = req.body.hasOwnProperty("message") ? req.body.message : "";
  let alertFlow = req.body.hasOwnProperty("alertFlow") ? req.body.alertFlow : AlertFlow.BOTTOM_UP;

  let acceptedQualityType = Object.values(QualityAlertType);

  if (acceptedQualityType.indexOf(qualityType) == -1) {
    return Response.json(res, Response.errorPayload(`qualityType ${qualityType} is not valid. Valid qualityTypes are ${acceptedQualityType}`), 400);
  }
  if (serialNumberCustomerList.length == 0) {
    return Response.json(res, Response.errorPayload(`serialNumberCustomerList must contain at-least one serialNumberCustomer`), 400);
  }

  if (!qualityAlert && qualityType != "") {
    return Response.json(res, Response.errorPayload(`qualityType must be "" in the case of qualityAlert = false`), 400);
  }

  return client
    .updateQualityAlert(alertID, serialNumberCustomerList, qualityType, qualityAlert, message, alertFlow, JWT.parseMspIDFromToken(jwt))
    .then((response: any) => {
      Response.json(res, response, response.status);
    })
    .catch((error: any) => Response.json(res, Response.errorPayload(error), Response.errorStatusCode(error)));
}
/**
 * @ignore
 * @swagger
 * /v1/quality-alert/update:
 *   post:
 *     security:
 *       - Bearer: []
 *     description: Update a quality alert for one or more serialNumberCustomer
 *     tags: ['quality-alert']
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: alertID
 *         description: alertID
 *         in: body
 *         required: true
 *         type: string
 *       - name: qualityType
 *         description: Quality type for the asset
 *         in: body
 *         required: true
 *         type: string
 *       - name: qualityAlert
 *         description: quality alert
 *         in: body
 *         required: true
 *         type: boolean
 *       - name: serialNumberCustomerList
 *         description: List of serialNumberCustomer
 *         in: body
 *         required: true
 *         type: array
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/updateAlert'
 */
