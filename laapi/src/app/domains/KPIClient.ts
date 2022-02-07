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

/**
 * @class KPIClient
 */
import Logger from "../modules/logger/Logger";
import OffChainDBClient from "./OffChainDBClient";
import RichQuerySQL from "../modules/rich-query-sql/RichQuerySQL";
import DateCreator from "../modules/date/DateCreator";
import env from "../defaults";
import Objects from "../modules/mapper/Objects";
import Strings from "../modules/mapper/Strings";
import { QueryTypes } from "sequelize";
import _ = require("lodash");

const IsoToLatLong = require("country-iso-to-coordinates");

export default class KPIClient extends OffChainDBClient {
  /**
   * Uses data stored in the SQL database to generate kpi statistics
   * @param filter
   * @param mspIDFromJWT
   */
  async kpiStats(filter: any, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] In kpiStats`);

    filter = filter === undefined ? Object.create({}) : filter;

    // Get default from to date if one of them is missing
    if (
      !filter.hasOwnProperty("productionDateTo") ||
      !filter.productionDateTo.hasOwnProperty("value")
    ) {
      filter["productionDateTo"] = { value: this.getDefaultDateValue("to") };
    }
    if (
      !filter.hasOwnProperty("productionDateFrom") ||
      !filter.productionDateFrom.hasOwnProperty("value")
    ) {
      filter["productionDateFrom"] = {
        value: this.getDefaultDateValue("from"),
      };
    }

    const counts: any = await this.getNumberVehicles(filter, mspIDFromJWT);

    const assetsPerDay: any = await this.assetsPerDay(filter, mspIDFromJWT);

    const qualityStatusRatio: any = await this.getQualityStatusRatio(
      filter,
      mspIDFromJWT
    );

    const AssetsCountPerCountryAndSupplier =
      await this.assetsPerManufacturerAndCountry(filter, mspIDFromJWT);

    const countsQualityAlerts: any = await this.getNumberQualityAlerts(
      mspIDFromJWT
    );

    const countsQualityAlertsByTime: any =
      await this.getNumberQualityAlertsByTime(filter, mspIDFromJWT);

    let output = {
      assetsCount: Number(counts[0].assets_count),
      ownAssetsCount: Number(counts[0].own_assets_count),
      otherAssetsCount: Number(counts[0].other_assets_count),
      assetsPerDay: assetsPerDay,
      qualityStatusRatio: qualityStatusRatio,
      AssetsCountPerCountryAndSupplier: AssetsCountPerCountryAndSupplier,
      qualityAlertCount: countsQualityAlerts,
      qualityAlertCountByTime: countsQualityAlertsByTime,
    };

    Logger.info(
      `[${mspIDFromJWT}] kpiStats with output ${JSON.stringify(output)}`
    );

    return output;
  }

  /**
   * Assets per day
   * @async
   * @param filter
   * @param mspIDFromJWT
   */
  async assetsPerDay(filter: any, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] In assetsPerDay`);
    const dateRange = {
      productionDateFrom: {
        value: filter.productionDateFrom.value
          ? filter.productionDateFrom.value
          : this.getDefaultDateValue("from"),
      },
      productionDateTo: {
        value: filter.productionDateTo.value
          ? filter.productionDateTo.value
          : this.getDefaultDateValue("to"),
      },
    };

    const richQuerySQLFilter = RichQuerySQL.create(
      dateRange,
      mspIDFromJWT
    ).query;

    const connectionPool = await this.connectAndSync(mspIDFromJWT);

    const whereCondition = await this.buildWhereCondition(richQuerySQLFilter);
    const queryString = `SELECT to_char(production_date_gmt,'YYYY-MM-DD') date, count(*) AS assets_counts,
                            sum(case when mspid  = '${mspIDFromJWT}' then 1 else 0 end) AS own_assets_count,
                            sum(case when mspid  != '${mspIDFromJWT}' then 1 else 0 end) AS other_assets_count
                            FROM assets
                            ${whereCondition.whereConditionString}
                            GROUP BY to_char(production_date_gmt,'YYYY-MM-DD')`;
    Logger.debug(`[${mspIDFromJWT}] Executing query: ${queryString}`);
    const assetsPerDay: any = await connectionPool.pool.query(
      queryString,
      this.createRawQueryOptionsWithReplacement(whereCondition.replacements)
    );

    return assetsPerDay.reduce((obj: any, item: any) => {
      if (!obj.hasOwnProperty("ownAssets")) {
        obj["ownAssets"] = this.prepareOutputObject(dateRange);
        obj["otherAssets"] = this.prepareOutputObject(dateRange);
      }
      obj.ownAssets[item.date] = Number(item.own_assets_count);
      obj.otherAssets[item.date] = Number(item.other_assets_count);
      return obj;
    }, {});
  }

  async assetsPerManufacturerAndCountry(filter: any, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] In assetsPerManufacturerAndCountry`);
    const connectionPool = await this.connectAndSync(mspIDFromJWT);

    const richQuerySQLFilter = RichQuerySQL.create(filter, mspIDFromJWT).query;

    const whereCondition = await this.buildWhereCondition(richQuerySQLFilter);
    const queryString = `SELECT custom_fields ->> 'businessPartnerName' as businessPartnerName, manufacturer, production_country_code_manufacturer,count(*) assets_count
                            FROM assets
                            ${whereCondition.whereConditionString}
                            GROUP BY manufacturer,custom_fields ->> 'businessPartnerName',production_country_code_manufacturer`;
    Logger.debug(`[${mspIDFromJWT})] Executing query: ${queryString}`);
    return connectionPool.pool
      .query(
        queryString,
        this.createRawQueryOptionsWithReplacement(whereCondition.replacements)
      )
      .then(async (response: any) => {
        return response.map((r: any) => {
          return {
            businessPartnerName: r.businesspartnername,
            manufacturer: r.manufacturer,
            countryCode: r.production_country_code_manufacturer,
            coordinates:
              IsoToLatLong[r.production_country_code_manufacturer].coordinate,
            assetsCount: Number(r.assets_count),
          };
        });
      });
  }

  /**
   * Get tiles data
   * @async
   * @param mspIDFromJWT
   */
  async getTilesData(mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] In getTilesData`);
    const filter = {
      productionDateFrom: {
        value: DateCreator.getBeginningDate(env.tilesDuration),
      },
      productionDateTo: { value: DateCreator.getToday() },
    };

    const counts: any = await this.getNumberVehicles(filter, mspIDFromJWT);

    const tiles = JSON.parse(
      JSON.stringify({
        assetsCount: Number(counts[0].assets_count),
        tilesDuration: env.tilesDuration,
        otherAssetsCount: Number(counts[0].other_assets_count),
        ownAssetsCount: Number(counts[0].own_assets_count),
      })
    );
    Logger.debug(`[${mspIDFromJWT}] Tiles output: ${JSON.stringify(tiles)}`);

    return tiles;
  }

  /**
   *
   * @param filter
   * @param mspIDFromJWT
   */
  async getNumberVehicles(filter: any, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] getNumberVehicles`);
    const connectionPool = await this.connectAndSync(mspIDFromJWT);

    const richQuerySQLFilter = RichQuerySQL.create(filter, mspIDFromJWT).query;

    const whereCondition = await this.buildWhereCondition(richQuerySQLFilter);
    const queryString = `SELECT COUNT(*) as assets_count,
                                 sum(case when mspid  = '${mspIDFromJWT}' then 1 else 0 end) as own_assets_count,
                                 sum(case when mspid  != '${mspIDFromJWT}' then 1 else 0 end) as other_assets_count
                                 FROM Assets
                                 ${whereCondition.whereConditionString};`;
    Logger.debug(`[${mspIDFromJWT}] Executing query: ${queryString}`);
    return connectionPool.pool.query(
      queryString,
      this.createRawQueryOptionsWithReplacement(whereCondition.replacements)
    );
  }

  /**
   * Gets the number of quality alerts per company and grouped by every quality type
   * @param mspIDFromJWT
   */
  async getNumberQualityAlerts(mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] getNumberQualityAlerts`);
    const connectionPool = await this.connectAndSync(mspIDFromJWT);

    const queryString = `WITH    my_nok_assets AS (SELECT serial_number_customer, custom_fields, mspid FROM assets WHERE quality_status = 'NOK' and mspid = '${mspIDFromJWT}'),
                                     other_nok_assets AS (SELECT serial_number_customer, custom_fields, mspid FROM assets WHERE quality_status = 'NOK' and mspid != '${mspIDFromJWT}'),
                                     total_assets_count AS (SELECT mspid, count(*) AS total_assets_count FROM assets GROUP BY mspid),
                                     combined AS(SELECT merged.mspid, merged.quality_type, COUNT(*) AS alert_count FROM (                      
                                            SELECT  alerts.serial_number_customer, my_nok_assets.mspid, alerts.quality_type FROM my_nok_assets JOIN alerts ON my_nok_assets.serial_number_customer = alerts.serial_number_customer
                                            UNION ALL
                                            SELECT  alerts.serial_number_customer, other_nok_assets.mspid, alerts.quality_type FROM other_nok_assets JOIN alerts ON other_nok_assets.serial_number_customer = alerts.child_serial_number_customer)  merged
                                            GROUP BY merged.mspid, merged.quality_type),
                             alert_count AS (SELECT mspid, SUM(alert_count) AS total_alert_count FROM combined GROUP BY mspid)
                        
                        SELECT total_assets_count.mspid, COALESCE(combined.quality_type, '') AS quality_type, COALESCE(combined.alert_count, 0) AS alert_count, total_assets_count.total_assets_count, COALESCE(alert_count.total_alert_count, 0) AS total_alert_count
                        FROM total_assets_count
                        LEFT JOIN combined ON total_assets_count.mspid = combined.mspid
                        LEFT JOIN alert_count ON total_assets_count.mspid = alert_count.mspid;`;
    Logger.debug(`[${mspIDFromJWT}] Executing query: ${queryString}`);

    return connectionPool.pool
      .query(queryString, {
        plain: false,
        raw: true,
        type: QueryTypes.SELECT,
      })
      .then(async (response: any) => {
        if (response.length < 1) {
          return response;
        } else {
          // Convert to CamelCase
          return _.mapValues(
            _.groupBy(
              response.map((tx: any) =>
                Objects.mapNestedKeys(tx, Strings.snakeCaseToCamelCase)
              ),
              "mspid"
            ),
            (clist: any) => clist.map((item: any) => _.omit(item, "mspid"))
          );
        }
      });
  }

  /**
   * Gets the number of quality alerts per company and grouped by every quality type and by every day
   * @param filter
   * @param mspIDFromJWT
   */
  async getNumberQualityAlertsByTime(filter: any, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] getNumberQualityAlertsByTime`);
    const connectionPool = await this.connectAndSync(mspIDFromJWT);

    const richQuerySQLFilter = RichQuerySQL.create(filter, mspIDFromJWT).query;

    const whereCondition = await this.buildWhereCondition(richQuerySQLFilter);
    // we need to replace production_date_gmt here since we use another date field in this case
    whereCondition.whereConditionString = whereCondition.whereConditionString
      .split("production_date_gmt")
      .join("alert_date");

    const queryString = `WITH    my_nok_assets AS (SELECT serial_number_customer, custom_fields, mspid FROM assets WHERE quality_status = 'NOK' and mspid = '${mspIDFromJWT}'),
                                     other_nok_assets AS (SELECT serial_number_customer, custom_fields, mspid FROM assets WHERE quality_status = 'NOK' and mspid != '${mspIDFromJWT}'),
                                     total_assets_count AS (SELECT mspid, count(*) AS total_assets_count FROM assets GROUP BY mspid),
                                     combined AS(SELECT merged.mspid, merged.quality_type, merged.alert_date, COUNT(*) AS alert_count FROM(
                        
                                            SELECT  alerts.serial_number_customer, my_nok_assets.mspid, alerts.quality_type, date_trunc('day', alerts."createdAt") AS alert_date FROM my_nok_assets JOIN alerts ON my_nok_assets.serial_number_customer = alerts.serial_number_customer
                                            UNION ALL
                                            SELECT  alerts.serial_number_customer, other_nok_assets.mspid, alerts.quality_type, date_trunc('day', alerts."createdAt") AS alert_date FROM other_nok_assets JOIN alerts ON other_nok_assets.serial_number_customer = alerts.child_serial_number_customer)  merged
                                            GROUP BY merged.mspid, merged.quality_type, merged.alert_date),
                             alert_count AS (SELECT mspid, SUM(alert_count) AS total_alert_count FROM combined GROUP BY mspid)
                        
                        SELECT combined.mspid, combined.alert_date, combined.quality_type, combined.alert_count, total_assets_count.total_assets_count, alert_count.total_alert_count
                        FROM combined
                        JOIN total_assets_count ON combined.mspid = total_assets_count.mspid
                        JOIN alert_count ON combined.mspid = alert_count.mspid
                        ${whereCondition.whereConditionString};`;
    Logger.debug(`[${mspIDFromJWT}] Executing query: ${queryString}`);

    return connectionPool.pool
      .query(
        queryString,
        this.createRawQueryOptionsWithReplacement(whereCondition.replacements)
      )
      .then(async (response: any) => {
        if (response.length < 1) {
          return response;
        } else {
          // Convert to CamelCase
          return _.mapValues(
            _.groupBy(
              response.map((tx: any) =>
                Objects.mapNestedKeys(tx, Strings.snakeCaseToCamelCase)
              ),
              "mspid"
            ),
            (clist: any) => clist.map((item: any) => _.omit(item, "mspid"))
          );
        }
      });
  }

  /**
   *
   * @param filter
   * @param mspIDFromJWT
   */
  async getQualityStatusRatio(filter: any, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] getQualityStatusRatio`);
    const connectionPool = await this.connectAndSync(mspIDFromJWT);

    const richQuerySQLFilter = RichQuerySQL.create(filter, mspIDFromJWT).query;

    const whereCondition = await this.buildWhereCondition(richQuerySQLFilter);
    // the union ensures that all manufacturers are there even if the value of this manufacturer in the given range is 0
    const queryString = `   WITH table1 AS (SELECT manufacturer,
                                                       sum(case when quality_status = 'OK' then 1 else 0 end)  as OK,
                                                       sum(case when quality_status = 'NOK' then 1 else 0 end) as NOK
                                                FROM assets
                                                ${whereCondition.whereConditionString}
                                                GROUP BY manufacturer)
                                SELECT *
                                FROM table1
                                
                                UNION ALL
                                
                                SELECT *
                                FROM (SELECT DISTINCT(manufacturer), 0 AS OK, 0 AS NOK FROM assets) table2
                                WHERE NOT exists(SELECT 1 FROM table1 WHERE table1.manufacturer = table2.manufacturer)`;
    Logger.debug(`[${mspIDFromJWT}] Executing query: ${queryString}`);
    const qualityStatusRatio: any = await connectionPool.pool.query(
      queryString,
      this.createRawQueryOptionsWithReplacement(whereCondition.replacements)
    );

    return qualityStatusRatio.reduce((obj: any, item: any) => {
      if (!obj.hasOwnProperty(item.manufacturer)) {
        obj[item.manufacturer] = {};
      }
      obj[item.manufacturer]["OK"] = Number(item.ok);
      obj[item.manufacturer]["NOK"] = Number(item.nok);
      delete obj[item.manufacturer].manufacturer;
      return obj;
    }, {});
  }

  /**
   * @param mspIDFromJWT
   */
  async getRelationshipStats(mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] getRelationshipStats`);
    const connectionPool = await this.connectAndSync(mspIDFromJWT);

    const queryString = `SELECT transfer_status, COUNT(*)
                                FROM relationships
                                GROUP BY transfer_status;`;
    Logger.debug(`[${mspIDFromJWT}] Executing query: ${queryString}`);
    return connectionPool.pool.query(
      queryString,
      this.createRawQueryOptionsWithReplacement(null)
    );
  }

  /**
   * Get affected parts between certain ranges
   *
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {string} mspIDFromJWT
   * @return {*}
   * @memberof KPIClient
   */
  async getAffectedParts(startDate: Date, endDate: Date, mspIDFromJWT: string) {
    Logger.debug(`[${mspIDFromJWT}] getAffectedParts in KPIClient}`);
    const filter = {
      productionDateFrom: { value: startDate },
      productionDateTo: { value: endDate },
      mspid: { value: mspIDFromJWT },
    };

    const richQuerySQLFilter = RichQuerySQL.create(filter, mspIDFromJWT).query;

    const connectionPool = await this.connectAndSync(mspIDFromJWT);

    const whereCondition = await this.buildWhereCondition(richQuerySQLFilter);

    const qualityAlertQueryColumn = `custom_fields ->> 'qualityAlert'`;

    const queryString = `SELECT to_char(production_date_gmt,'YYYY-MM-DD') as date, 
    custom_fields ->> 'qualityType' as quality_type, 
    SUM(case when ${qualityAlertQueryColumn} = 'true' then 1 else 0 end) as number_of_alerts 
    FROM assets
    ${whereCondition.whereConditionString} AND ${qualityAlertQueryColumn} = 'true'
    GROUP BY date, quality_type 
    ORDER BY date`;

    Logger.debug(`[${mspIDFromJWT}] Executing query: ${queryString}`);
    return connectionPool.pool
      .query(
        queryString,
        this.createRawQueryOptionsWithReplacement(whereCondition.replacements)
      )
      .then(async (response: any) =>
        response.map((alert: any) => {
          return {
            date: alert.date,
            qualityType: alert.quality_type,
            numberOfAlerts: Number(alert.number_of_alerts),
          };
        })
      );
  }

  /**
   * Gets the top alerts and the remaining values grouped by quality type
   *
   * @param {string} eventFlow
   * @param {number} numberOfAlerts
   * @param {string} mspIDFromJWT
   * @return {*}
   * @memberof KPIClient
   */
  async getTopAlerts(
    eventFlow: string,
    numberOfAlerts: number,
    mspIDFromJWT: string
  ) {
    Logger.debug(
      `[${mspIDFromJWT}] Get top alerts in KPI Client. Parameters: ${eventFlow}, ${numberOfAlerts}, ${mspIDFromJWT}`
    );
    const filter = { alertFlow: { value: eventFlow } };
    const richQuerySQLFilter = RichQuerySQL.create(filter, mspIDFromJWT).query;
    const whereCondition = await this.buildWhereCondition(richQuerySQLFilter);
    const connectionPool = await this.connectAndSync(mspIDFromJWT);

    const tableColumnFilter =
      eventFlow && eventFlow === "BOTTOM-UP"
        ? "al.status='pending' AND al.alert_id IN (SELECT alert_id FROM alerts WHERE child_serial_number_customer <> '')"
        : "qa.status='external'";

    const queryString = `WITH cte_alerts AS 
                        (SELECT qa.alert_flow, 
                                al."updatedAt" AS updated,
                                al."createdAt" AS created,
                                ev.event_origin_company,
                                ev.event_target_company,
                                ev.origin_partner_name,
                                al.alert_id, 
                                al.serial_number_customer, 
                                al.child_serial_number_customer, 
                                al.quality_type, 
                                al.quality_alert, 
                                al.mspid, 
                                al.customer_oneid, 
                                al.status, 
                                al.propagated, 
                                al.app_name, 
                                al.history, 
                                al.part_name_manufacturer, 
                                al.part_number_manufacturer, 
                                al.child_part_name_manufacturer, 
                                al.child_part_number_manufacturer, 
                                al.child_customer_oneid,
                                CASE
                                  WHEN al.quality_type = 'LIFE-THREATENING' THEN 0
                                  WHEN al.quality_type = 'CRITICAL' THEN 1
                                  WHEN al.quality_type = 'MAJOR' THEN 2
                                  WHEN al.quality_type = 'MINOR' THEN 3
                                  ELSE 4
                                END AS criticality_level
                        FROM alerts al 
                        INNER JOIN qualityalert qa ON qa.alert_id=al.alert_id
                        INNER JOIN events ev ON ev.alert_id=al.alert_id
                        ${whereCondition.whereConditionString} 
                        AND ${tableColumnFilter}),

                        cte_top AS 
                        (SELECT alert_id, 
                          updated, 
                          criticality_level 
                        FROM cte_alerts 
                        GROUP BY alert_id, updated, criticality_level
                        ORDER BY updated DESC, criticality_level ASC
                        LIMIT ${numberOfAlerts})

                        (SELECT al.alert_id, 
                          al.serial_number_customer, 
                          al.child_serial_number_customer, 
                          al.quality_type, 
                          al.quality_alert, 
                          al.mspid, 
                          al.customer_oneid, 
                          al.status, 
                          al.propagated, 
                          al.app_name, 
                          al.history, 
                          al.part_name_manufacturer, 
                          al.part_number_manufacturer, 
                          al.child_part_name_manufacturer, 
                          al.child_part_number_manufacturer, 
                          al.child_customer_oneid, 
                          'TopAlerts' AS Type, 
                          1 AS total,
                          al.alert_flow,
                          al.updated,
                          al.created,
                          al.event_origin_company,
                          al.event_target_company,
                          al.origin_partner_name
                        FROM cte_alerts al
                        INNER JOIN cte_top ON cte_top.alert_id = al.alert_id
                        ORDER BY al.updated DESC, al.criticality_level ASC)

                        UNION ALL

                        (SELECT '' AS alert_id, 
                               '' AS serial_number_customer, 
                               MAX(al.child_serial_number_customer) AS child_serial_number_customer,
                               al.quality_type,
                               FALSE AS quality_alert, 
                               '' AS mspid, 
                               '' AS customer_oneid, 
                               '' AS status, 
                               FALSE AS propagated, 
                               '' AS app_name, 
                               '{}' AS history, 
                               '' AS part_name_manufacturer, 
                               '' AS part_number_manufacturer, 
                               '' AS child_part_name_manufacturer, 
                               '' AS child_part_number_manufacturer, 
                               '' AS child_customer_oneid, 
                               'Remaining' AS Type, 
                               COUNT(al.quality_type) as total,
                               '' AS alert_flow,
                               MIN(al.updated) AS updated, 
                               MIN(al.created) AS created,
                               '' AS event_origin_company,
                               '' AS event_target_company,
                               '' AS origin_partner_name
                        FROM cte_alerts al
                        LEFT JOIN cte_top ON cte_top.alert_id = al.alert_id
                        WHERE cte_top.alert_id IS NULL
                        GROUP BY quality_type)`;

    Logger.debug(`[${mspIDFromJWT}] Executing query: ${queryString}`);
    return connectionPool.pool
      .query(
        queryString,
        this.createRawQueryOptionsWithReplacement(whereCondition.replacements)
      )
      .then(async (response: any) => {
        Logger.debug(
          `[${mspIDFromJWT}] Parsing query (${
            response.length
          }): ${JSON.stringify(response)}`
        );

        const topAlerts: any[] = response.filter(
          (top: any) => top.type.toLocaleLowerCase() === "topalerts"
        );

        const remaining: any[] = response.filter(
          (alerts: any) => alerts.type.toLocaleLowerCase() === "remaining"
        );

        const groupedRemaining = _.groupBy(remaining, "quality_type");

        const mappedRemainingObj: any = {};

        for (const group in groupedRemaining) {
          mappedRemainingObj[group] = _.sum(
            groupedRemaining[group].map((rem: any) => +rem.total)
          );
        }

        const topAlertsToCamelCase = topAlerts.map((top: any) => {
          return _.reduce(
            top,
            (acc: any, value: any, key: any) => {
              const camelKey = _.camelCase(key);
              acc[camelKey] = value;
              return acc;
            },
            {}
          );
        });

        return {
          topAlerts: topAlertsToCamelCase,
          remainingAlerts: mappedRemainingObj,
        };
      });
  }

  /**
   * Prepare output object
   * @protected
   * @param dateRange
   */
  protected prepareOutputObject(dateRange: any) {
    const output = Object.create({});

    const currentDate = new Date(
      Date.parse(dateRange.productionDateFrom.value)
    );
    const endDate = new Date(Date.parse(dateRange.productionDateTo.value));

    output[this.dateToDateString(currentDate)] = 0;

    let proceed = true;
    while (proceed) {
      currentDate.setDate(currentDate.getDate() + 1);
      const date = this.dateToDateString(currentDate);

      output[date] = 0;
      proceed = currentDate.getTime() < endDate.getTime();
    }

    return output;
  }

  /**
   * Cut date from timestamp string
   * @protected
   * @param timestamp
   */
  protected cutDateFromTimestamp(timestamp: string) {
    const dateMask = "yyyy-mm-dd";

    return timestamp.substr(0, dateMask.length);
  }

  /**
   * Get default value for date range
   * @protected
   * @param key
   * @param defaultPeriod
   */
  protected getDefaultDateValue(key: string, defaultPeriod: number = 30) {
    //default period in days
    const date = new Date();

    if (key === "from") {
      date.setDate(date.getDate() - defaultPeriod);
    }

    return this.dateToDateString(date);
  }

  /**
   * Convert date to DateString
   * @protected
   * @param date
   */
  protected dateToDateString(date: Date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return (
      date.getFullYear() +
      "-" +
      (month < 10 ? "0" : "") +
      month +
      "-" +
      (day < 10 ? "0" : "") +
      day
    );
    //    + 'T00:00:00Z';
  }
}
