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
import _ = require("lodash");


/**
 * Get relationships
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export default async function GetRelationships(req: any, res: any, next: any) {


    const loadChildrenLevel = 0;

    const jwt = JWT.parseFromHeader(
        req.header('Authorization')
    );

    if (!req.query.hasOwnProperty("productionDateFrom")) {
        return Response.json(res, Response.errorPayload(`Request is missing key productionDateFrom`), 400);
    }

    if (!req.query.hasOwnProperty("productionDateTo")) {
        return Response.json(res, Response.errorPayload(`Request is missing key productionDateTo`), 400);
    }


    const productionDateFrom: string = decodeURIComponent(req.query.productionDateFrom);
    const productionDateTo: string = decodeURIComponent(req.query.productionDateTo);

    const pagination = (req.query.hasOwnProperty("pagination") ? Number(req.query.pagination) : -1);

    const filter = {
        "type":{
            "value": "own"
        },
        "productionDateFrom": {
            "value": productionDateFrom
        },
        "productionDateTo": {
            "value": productionDateTo
        }
    }
    const fields = ["serialNumberCustomer", "componentsSerialNumbers","customFields" ];

    const offChainDBClient = new OffChainDBClient();

    return await offChainDBClient.getAssetList(
        filter,
        fields,
        loadChildrenLevel,
        JWT.parseMspIDFromToken(jwt),
        pagination
    ).then(
        (response: any) => {
            // Process response for cx format
            if (Array.isArray(response.data) && response.data.length > 0) {
                response.data = response.data.map(
                    (rel: any) => {
                        rel['isParentOf'] = rel.componentsSerialNumbers
                        rel['customerUniqueId'] = rel.serialNumberCustomer
                        rel['manufacturerOneId'] = rel.customFields.manufactureroneid
                        return _.pick(rel, ['manufacturerOneId', 'isParentOf', 'customerUniqueId'])
                    }
                );
            }


            Response.json(res, response, 200)
        }
    ).catch(
        (error: any) => Response.json(res, Response.errorPayload(error), Response.errorStatusCode(error))
    );


}
/**
 * @ignore
 * @swagger
 * /v1/off-hlf-db/relationships:
 *   get:
 *     security:
 *       - Bearer: []
 *     description: Get Relationships of own assets by given date filter
 *     tags: ['off-hlf-db']
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: pagination
 *         description: Pagination parameter (-1 for no pagination, 1 for first page, 2 for second page, ...)
 *         schema:
 *           type: number
 *           example: 1
 *       - in: query
 *         name: productionDateFrom
 *         description: earliest productionDateGmt of the assets
 *         schema:
 *           type: string
 *           example: 2021-06-14T00:00:00.000Z
 *       - in: query
 *         name: productionDateTo
 *         description: latest productionDateGmt of the assets
 *         schema:
 *           type: string
 *           example: 2022-06-16T23:00:00.000Z
 *     responses:
 *       200:
 *         description: Relationships matched by given query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultLength:
 *                   type: number
 *                 nextPage:
 *                    type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       manufacturerOneId:
 *                         type: string
 *                       customerUniqueId:
 *                         type: string
 *                       isParentOf:
 *                         type: array
 *                         items:
 *                           type: string
 */
