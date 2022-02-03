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
import { generateID } from "../../modules/helper-functions/Helper";

/**
 * Create quality alert
 * @param req
 * @param res
 * @param next
 * @constructor
 *
 */
export default async function CreateQualityAlert(req: any, res: any, next: any) {
  const client = new QualityAlertMgmtClient();
  const jwt = JWT.parseFromHeader(req.header("Authorization"));

  if (!req.body.hasOwnProperty("qualityType")) {
    return Response.json(res, Response.errorPayload(`Request body is missing qualityType key`), 400);
  }
  if (!req.body.hasOwnProperty("serialNumberCustomerList")) {
    return Response.json(res, Response.errorPayload(`Request body is missing serialNumberCustomerList key`), 400);
  }
  if (!req.body.hasOwnProperty("qualityAlert")) {
    return Response.json(res, Response.errorPayload(`Request body is missing qualityAlert key`), 400);
  }
  let { serialNumberCustomerList, qualityType, qualityAlert } = req.body;

  qualityType = qualityType.toUpperCase();
  let acceptedQualityType = Object.values(QualityAlertType);
  if (acceptedQualityType.indexOf(qualityType) == -1) {
    return Response.json(res, Response.errorPayload(`qualityType ${qualityType} is not valid. Valid qualityTypes are ${acceptedQualityType}`), 400);
  }

  if (!qualityAlert && qualityType != "") {
    return Response.json(res, Response.errorPayload(`qualityType must be "" in the case of qualityAlert = false`), 400);
  }

  if (serialNumberCustomerList.length == 0) {
    return Response.json(res, Response.errorPayload(`serialNumberCustomerList must contain at-least one serialNumberCustomer`), 400);
  }

  const alertId = await generateID(16);
  const relatedAlertId = req.body.hasOwnProperty("relatedAlertId") ? req.body.relatedAlertId : "";
  const message = req.body.hasOwnProperty("message") ? req.body.message : "";
  const alertFlow = req.body.hasOwnProperty("alertFlow") ? req.body.alertFlow : AlertFlow.BOTTOM_UP;

  return client
    .createQualityAlert(
      alertId,
      serialNumberCustomerList,
      qualityType,
      qualityAlert,
      message,
      alertFlow,
      JWT.parseMspIDFromToken(jwt),
      relatedAlertId,
    )
    .then((response: any) => {
      Response.json(res, response, response.status);
    })
    .catch((error: any) => Response.json(res, Response.errorPayload(error), Response.errorStatusCode(error)));
}
/**
 * @ignore
 * @swagger
 * /v1/quality-alert/create:
 *   post:
 *     security:
 *       - Bearer: []
 *     description: Create a quality alert for one or more serialNumberCustomer
 *     tags: ['quality-alert']
 *     parameters:
 *       - name: superId
 *         description: SuperID of the quality alert
 *         in: body
 *         required: true
 *         type: string
 *       - name: relatedAlertId
 *         description: related alertID of the quality alert
 *         in: body
 *         required: true
 *         type: string
 *       - name: qualityType
 *         description: Quality type for the asset
 *         in: body
 *         required: true
 *         type: string
 *       - name: qualityType
 *         description: Quality type for the asset
 *         in: body
 *         required: true
 *         type: string
 *       - name: alertFlow
 *         description: bottom-up or top-down
 *         in: body
 *         required: true
 *         type: string
 *       - name: message
 *         description: Message of the quality alert
 *         in: body
 *         required: true
 *         type: string
 *       - name: qualityAlert
 *         description:  quality alert of the asset
 *         in: body
 *         required: true
 *         type: boolean
 *       - name: serialNumberCustomerList
 *         description: List of serialNumberCustomer
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
