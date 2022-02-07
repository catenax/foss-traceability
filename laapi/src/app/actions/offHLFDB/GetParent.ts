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

import JWT from './../../modules/jwt/JWT';
import ResponseModel from "../../modules/response/Response";
import OffChainDBClient from "../../domains/OffChainDBClient";
import Logger from "../../modules/logger/Logger";
import {Request,Response} from 'express'

/**
 * Get asset from the Ledger by primary key action along with parent
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export default async function getParent(req: Request, res: Response, next: any) {
    Logger.debug(`called getParent is called = ${JSON.stringify(req.params)}`);
    const jwt = JWT.parseFromHeader(
        req.header('Authorization')
    );

    if (!req.params.hasOwnProperty("serialNumberCustomer")) {
        return  res.sendStatus(400).send(`Request is missing key serialNumberCustomer`);
    }

    let serialNumberCustomer: string = decodeURIComponent(req.params.serialNumberCustomer);

    const offChainDBClient = new OffChainDBClient();
    return offChainDBClient.getParent(
        serialNumberCustomer,
        JWT.parseMspIDFromToken(jwt)
    ).then(
        (response: any) => {
          return  res.send(response)
        }
    ).catch(
        (error: any) => {
            return res.sendStatus(ResponseModel.errorStatusCode(error)).send(ResponseModel.errorPayload(error))
        });


}
/**
 * @ignore
 * @swagger
 * /v1/asset/{serialNumberCustomer}/parent:
 *   get:
 *     security:
 *       - Bearer: []
 *     description: Get asset from the ledger by primary key along with parent
 *     tags: ['asset']
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: serialNumberCustomer
 *         required: true
 *         description: Serial Number Customer
 *         schema:
 *           type: string
 *     responses:
 *       400:
 *         description: Request is missing key serialNumberCustomer
 *       200:
 *         description: asset object matched by given query along with parent object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/AssetWithParent'
 */
