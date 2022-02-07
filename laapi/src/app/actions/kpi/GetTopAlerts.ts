import KPIClient from "../../domains/KPIClient";
import JWT from "../../modules/jwt/JWT";
import Logger from "../../modules/logger/Logger";
import Response from "../../modules/response/Response";

export default async function GetTopAlerts(req: any, res: any) {
  const jwt: string = JWT.parseFromHeader(req.header("Authorization"));
  const eventFlow: string = (req.query && req.query.eventFlow) || "BOTTOM-UP";
  const numberOfTopAlerts: number = (req.query && req.query.topAlerts) || 5;
  Logger.debug(
    `Get the top ${numberOfTopAlerts} ${
      eventFlow === "BOTTOM-UP" ? "quality alerts" : "investigations"
    }`
  );

  return new KPIClient()
    .getTopAlerts(eventFlow, numberOfTopAlerts, JWT.parseMspIDFromToken(jwt))
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
 * /v1/kpi/alert-summary:
 *   get:
 *     security:
 *       - Bearer: []
 *     description: Get the top alerts by event flow mapping the remaining ones by quality type
 *     tags: ['kpi']
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: topAlerts
 *         description: Defines the top amount of alerts
 *         in: "query"
 *         required: false
 *         type: integer
 *         default: 5
 *       - name: eventFlow
 *         description: Defines the alert type event flow (BOTTOM-UP OR TOP-DOWN)
 *         in: "query"
 *         required: false
 *         type: "string"
 *         default: "BOTTOM-UP"
 *     responses:
 *       200:
 *         description: Top alerts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Summary'
 */
