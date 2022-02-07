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

import OffChainDBClient from "../../domains/OffChainDBClient";
import JWT from '../../modules/jwt/JWT';
import Response from "../../modules/response/Response";
import Logger from "../../modules/logger/Logger";
import Objects from "../../modules/mapper/Objects";
import Strings from "../../modules/mapper/Strings";

/**
 * Get asset list from the Ledger by given filter
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export default async function GetQualityAlert(req: any, res: any, next: any) {

    const startDate = (req.query.startDate ? new Date( req.query.startDate) : undefined);
    const endDate =  (req.query.endDate ? new Date( req.query.endDate) : new Date());
    Logger.debug(`[GetQualityAlert] startDate: ${startDate} || endDate: ${endDate}`)
    const jwt = JWT.parseFromHeader(
        req.header('Authorization')
    );

    const offChainDBClient = new OffChainDBClient();

    return await offChainDBClient.getQualityAlert(
        startDate,
        endDate,
        JWT.parseMspIDFromToken(jwt)
    ).then(
        (response: any) =>    Response.json(
            res,
            response.map((tx: any) => Objects.mapKeys(tx.toJSON(), Strings.snakeCaseToCamelCase)),
            200,
          )
    ).catch(
        (error: any) => Response.json(res, Response.errorPayload(error), Response.errorStatusCode(error))
    );


}
/**
 * @ignore
 * @swagger
 * /v1/off-hlf-db/quality-alert:
 *   post:
 *     security:
 *       - Bearer: []
 *     description: Get asset list from the ledger by given filter
 *     tags: ['off-hlf-db']
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: startDate
 *         description: define the lower bound of the created date of the quality alert (close interval)
 *         in: "query"
 *         required: false
 *         schema:
 *           type: "string"
 *       - name: endDate
 *         description: define the upper bound of the created date of the quality alert (close interval)
 *         in: "query"
 *         required: false
 *         schema:
 *           type: "string"
 *
 *     responses:
 *       200:
 *         description: asset list matched by given query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/qualityAlert'
 */
