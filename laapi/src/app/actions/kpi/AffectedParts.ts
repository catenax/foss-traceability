import Response from "../../modules/response/Response";
import JWT from "../../modules/jwt/JWT";
import Logger from "../../modules/logger/Logger";
import KPIClient from "../../domains/KPIClient";

export default async function affectedParts(req: any, res: any) {
  const jwt = JWT.parseFromHeader(req.header("Authorization"));

  if (!req.query.hasOwnProperty("startDate")) {
    return res.sendStatus(400).send(`Request is missing key startDate`);
  }

  const startDate = new Date(req.query.startDate);
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

  Logger.debug(`Get affected parts from ${startDate} to ${endDate}`);

  const kpiClient = new KPIClient();
  return kpiClient
    .getAffectedParts(startDate, endDate, JWT.parseMspIDFromToken(jwt))
    .then((response: any) => res.json(response))
    .catch((error: any) =>
      Response.json(
        res,
        Response.errorPayload(error),
        Response.errorStatusCode(error)
      )
    );
}
/**
 * @ignore
 * @swagger
 * /v1/kpi/affected-parts:
 *   get:
 *     security:
 *       - Bearer: []
 *     description: Get affected parts within the provided period
 *     tags: ['kpi']
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: startDate
 *         description: Defines the lower bound for the created assets (close interval)
 *         in: "query"
 *         required: true
 *         type: "string"
 *       - name: endDate
 *         description: Defines the upper bound for the created assets (close interval)
 *         in: "query"
 *         required: false
 *         type: "string"
 *     responses:
 *       200:
 *         description: Number of affected parts by category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/AffectedPartsList'
 *       400:
 *         description: Request is missing key startDate
 */
