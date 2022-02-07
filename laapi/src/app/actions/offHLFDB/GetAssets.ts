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
 

key.See the License for the  key in queryParamssp{
 * 
 * 
 * 

 * ecific language governing permissions and
 * limitations under the License.
 */

import OffChainDBClient from "../../domains/OffChainDBClient";
import JWT from '../../modules/jwt/JWT';
import env from "../../defaults";
import {Request,Response} from 'express';
import ResponseModel from "../../modules/response/Response";
import Logger from '../../modules/logger/Logger';


/**
 * Get asset list from the Ledger by given filter
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export default async function GetAssets(req: Request, res: Response, next: any) {

    Logger.debug(`getAssets is called  queryparams = ${JSON.stringify(req.query)} `)
    const queryParams = req.query;

    const loadChildrenLevel = (req.query.hasOwnProperty("loadChildrenLevel") ? Number(req.query.loadChildrenLevel) : Number(env.childrenMaxRecursiveLimits.list));
    delete queryParams['loadChildrenLevel']
    const pagination = (queryParams.hasOwnProperty("pagination") ? Number(queryParams.pagination) : 1);
    delete queryParams['pagination']

    //Parse queryparam to fit richQuerySQL format
    for (let key in queryParams ){

        if(queryParams.hasOwnProperty(key)){
            queryParams[key] = {"value": queryParams[key]};
        }

    }

    const filter = queryParams ? queryParams : Object.create({});
    const fields = (req.body.fields ? req.body.fields : undefined);

    const jwt = JWT.parseFromHeader(
        req.header('Authorization')
    );


    const offChainDBClient = new OffChainDBClient();

    return await offChainDBClient.getAssetList(
        filter,
        fields,
        loadChildrenLevel,
        JWT.parseMspIDFromToken(jwt),
        pagination
    ).then(
        (response: any) => ResponseModel.json(res, response, 200)
    ).catch(
        (error: any) => ResponseModel.json(res, ResponseModel.errorPayload(error), ResponseModel.errorStatusCode(error))
    );


}
/**
 * @ignore
 * @swagger
 * /v1/asset/:
 *   get:
 *     security:
 *       - Bearer: []
 *     description: Get asset list from the ledger by given filter
 *     tags: ['asset']
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: filter
 *         description: Filter object
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/FilterObjectWithPagination'
 *     responses:
 *       200:
 *         description: asset list matched by given query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/AssetListResponse'
 */
