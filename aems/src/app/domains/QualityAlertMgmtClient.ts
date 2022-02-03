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

import SmartContractClient from "./SmartContractClient";
import Logger from "../modules/logger/Logger";
import OffChainDBClient from "./OffChainDBClient";
import QualityAlert, {
  QualityModel,
  QualityAlertModel,
  QualityAlertPartsModel,
  QualityAlertEventModel,
  AlertModel,
} from "../interfaces/QualityAlert";
import { EventStatus, QualityAlertStatus, QualityAlertType, AlertFlow, AlertHistoryStatus } from "../enums/QualityStatus";
import { Event, EventBody, EventModel } from "../interfaces/Events";
import { CommentModel, CommentBody } from "../interfaces/Comment";
import { AlertHistoryModel } from "../interfaces/AlertHistory";
import { ResponseStatus } from "../enums/ResponseStatus";
import AlertHistoryConsumer from "../modules/kafka/AlertHistoryConsumer";
import QualityAlertKafka from "../modules/kafka/QualityAlertConsumer";
import PartsAlert from "../types/PartAlerts";
import Events from "../types/Events";
import History from "../types/History";
import Comments from "../types/Comments";
import {
  getCustomerOneIDFromMSP,
  getMSPFromCustomerOneID,
  getWeightageByQualityType,
  returnFunction,
  sendEmail,
  getMinAndMaxDate,
  getContactInfo,
  generateID,
} from "../modules/helper-functions/Helper";
const { Op } = require("sequelize");
const axios = require("axios");
import { readFileSync } from "fs";
import defaults from "../defaults";

/**
 *
 */
export default class QualityAlertMgmtClient extends SmartContractClient {
  /**
   *
   *
   * @param {string} alertID
   * @param {string[]} serialNumberCustomerList
   * @param {string} qualityType
   * @param {boolean} qualityAlert
   * @param {string} message
   * @param {string} alertFlow
   * @param {string} mspIDFromJWT
   * @param {string} [eventOrigin="PartChain"]
   * @return {*}
   * @memberof QualityAlertMgmtClient
   */
  async createQualityAlert(
    alertID: string,
    serialNumberCustomerList: string[],
    qualityType: string,
    qualityAlert: boolean,
    message: string,
    alertFlow: string,
    mspIDFromJWT: string,
    eventOrigin: string = "PartChain",
    relatedAlertId: string = "",
  ) {
    Logger.info(`Called createQualityAlert`);
    const alerts: Array<QualityAlert> = [];
    const events: Array<Event> = [];
    const comments: Array<CommentModel> = [];
    const alertHistories: Array<AlertHistoryModel> = [];
    const assetsToProcess: any[] = [];
    const assetsNotProcessed: string[] = [];
    const organizationList = new Map();
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
    Logger.info(`[${mspIDFromJWT}] createQualityAlert: alertID = ${alertID} & relatedAlertId = ${relatedAlertId} `);
    for await (let serialNumberCustomer of serialNumberCustomerList) {
      const checkSerialNumberCustomer = await this.getQualityAlertDetailWithStatus(
        alertID,
        serialNumberCustomer,
        QualityAlertStatus.PENDING,
        mspIDFromJWT,
      );
      // Check if the asset is already stored in offChain
      let response = await offChainDBClient.getAssetDetail(serialNumberCustomer, 0, mspIDFromJWT);
      Logger.info(`[${mspIDFromJWT}] createQualityAlert: response = ${JSON.stringify(response)} `);
      Logger.debug(`[${mspIDFromJWT}] createQualityAlert: checkSerialNumberCustomer = ${JSON.stringify(checkSerialNumberCustomer)} `);
      Logger.debug(`[${mspIDFromJWT}] createQualityAlert: response length = ${response.length} `);
      // validate if the mspID is same as that of the mspIDFromJWT
      if (response.mspid == undefined || checkSerialNumberCustomer.length > 0) {
        Logger.error(`[${mspIDFromJWT}] createQualityAlert: serialNumberCustomer ${serialNumberCustomer} will not be processed`);
        assetsNotProcessed.push(serialNumberCustomer);
      } else {
        Logger.info(`[${mspIDFromJWT}] createQualityAlert: serialNumberCustomer ${serialNumberCustomer} will be processed`);
        assetsToProcess.push({
          serialNumberCustomer,
          customeroneid: response.customFields.customeroneid,
          qualityType: response.customFields.hasOwnProperty("qualitytype") ? response.customFields.qualitytype : "OK",
          qualityAlert: response.customFields.qualityalert,
          partNameManufacturer: response.partNameManufacturer,
          partNumberManufacturer: response.partNumberManufacturer,
          manufacturer: response.manufacturer,
          partnerName: alertFlow === AlertFlow.TOP_DOWN ? response.customFields.customerpartnername : response.customFields.businesspartnername,
        });
      }
    }
    Logger.debug(`[${mspIDFromJWT}] createQualityAlert: assetsToProcess = ${JSON.stringify(assetsToProcess)} `);
    Logger.debug(`[${mspIDFromJWT}] createQualityAlert: assetsNotProcessed = ${JSON.stringify(assetsNotProcessed)} `);
    //Form the data for inserting to the alert table
    for await (let asset of assetsToProcess) {
      // get old qualityAlert and qualityType
      const currentQualityStatus: QualityModel = { qualityType: asset.qualityType, qualityAlert: asset.qualityAlert };
      // Get mspId of the manufacture
      const manufactureMspId = await getMSPFromCustomerOneID(asset.manufacturer);
      Logger.info(`[${mspIDFromJWT}] createQualityAlert: manufactureMspId = ${manufactureMspId} `);
      // creating quality alert for the  received part
      const partAlert: PartsAlert = new PartsAlert(
        alertID,
        asset.serialNumberCustomer,
        "",
        qualityType,
        qualityAlert,
        manufactureMspId,
        false,
        "PartChain",
        alertFlow === AlertFlow.BOTTOM_UP ? QualityAlertStatus.PENDING : QualityAlertStatus.REVIEW,

        asset.customeroneid,
        currentQualityStatus,
        asset.partNameManufacturer,
        asset.partNumberManufacturer,
        "",
        "",
        "",
      );
      alerts.push(partAlert);
      const targetOrg = alertFlow === AlertFlow.TOP_DOWN ? asset.manufacturer : asset.customeroneid;
      Logger.info(`[${mspIDFromJWT}] createQualityAlert: targetOrg = ${targetOrg} `);
      organizationList.set(targetOrg, asset.partnerName);
    }

    Logger.debug(`[${mspIDFromJWT}] createQualityAlert: alerts Array = ${JSON.stringify(alerts)} `);
    Logger.debug(`[${mspIDFromJWT}] createQualityAlert: organisationList = ${JSON.stringify(organizationList)} `);

    for await (let org of organizationList) {
      Logger.info(`[${mspIDFromJWT}] createQualityAlert: org set = ${JSON.stringify(org)} `);
      const eventOriginCompany = await getCustomerOneIDFromMSP(mspIDFromJWT);
      Logger.debug(`[${mspIDFromJWT}] createQualityAlert: eventOriginCompany= ${eventOriginCompany} `);

      const eventFilter = {
        event_uid: alertID,
        event_origin_company: eventOriginCompany,
        event_target_company: org[0],
      };
      let eventData = await connectionPool.eventModel.findAll({
        where: eventFilter,
      });

      Logger.info(`[${mspIDFromJWT}] createQualityAlert: eventData = ${JSON.stringify(eventData)}`);
      if (eventData.length === 0) {
        const eventUid = await generateID(32);
        const customerEvent: Events = new Events(
          eventUid,
          alertID,
          eventOrigin,
          eventOriginCompany,
          org[0] as string,
          qualityType,
          EventStatus.PENDING,
          alertFlow,
          "",
          false,
          org[1] as string,
        );
        events.push(customerEvent);

        // Comment Object
        const commentId = await generateID(32);
        const initialComment: Comments = new Comments(commentId, alertID, eventOriginCompany, org[0] as string, message, eventOriginCompany);
        comments.push(initialComment);

        // History Object
        const history = new History(alertID, eventOriginCompany, org[0] as string, AlertHistoryStatus.CREATED);
        alertHistories.push(history);
      }
    }

    if (alerts.length > 0) {
      //Insert data to the alert Table

      Logger.info(`[${mspIDFromJWT}] createQualityAlert: Insert data to the alert Table alerts Array = ${JSON.stringify(alerts)} `);
      const result = await connectionPool.partQualityAlertModel.bulkCreate(alerts);
      Logger.debug(`[${mspIDFromJWT}] createQualityAlert: alert result = ${JSON.stringify(result)}`);
      Logger.info(`[${mspIDFromJWT}] createQualityAlert: creating entry in alert table`);
      await connectionPool.alertModel.create({
        alert_id: alertID,
        status: QualityAlertStatus.PENDING,
        alert_flow: alertFlow,
        related_alert: relatedAlertId,
      });
    }

    Logger.info(`[${mspIDFromJWT}] createQualityAlert: events = ${JSON.stringify(events)} `);

    if (events.length > 0) {
      //Insert data to the event Table
      const result = await connectionPool.eventModel.bulkCreate(events);
      Logger.debug(`[${mspIDFromJWT}] createQualityAlert: event result = ${JSON.stringify(result)}`);
    }
    if (comments.length > 0) {
      //Insert data to the comment Table
      Logger.info(`[${mspIDFromJWT}] createQualityAlert: creating comments = ${JSON.stringify(comments)}`);
      const result = await connectionPool.commentModel.bulkCreate(comments);
      Logger.debug(`[${mspIDFromJWT}] createQualityAlert: event result = ${JSON.stringify(result)}`);
    }

    if (alertHistories.length > 0) {
      //Insert data to the comment Table
      Logger.info(`[${mspIDFromJWT}] createQualityAlert: creating alert history = ${JSON.stringify(alertHistories)}`);
      const result = await connectionPool.alertHistoryModel.bulkCreate(alertHistories);
      Logger.debug(`[${mspIDFromJWT}] createQualityAlert: alert history result = ${JSON.stringify(result)}`);
    }

    return {
      status: 200,
      data: {
        alertID,
        processedSerialNumberCustomers: assetsToProcess.length,
        failedSerialNumberCustomers: assetsNotProcessed.length,
        eventsCreated: events.length,
      },
    };
  }

  /**
   *
   *
   * @param {string} alertID
   * @param {string[]} serialNumberCustomerList
   * @param {string} qualityType
   * @param {boolean} qualityAlert
   * @param {string} mspIDFromJWT
   * @memberof QualityAlertMgmtClient
   */
  async updateQualityAlert(
    alertID: string,
    serialNumberCustomerList: string[],
    qualityType: string,
    qualityAlert: boolean,
    comment: string = "Default comment",
    alertFlow: string,
    mspIDFromJWT: string,
  ) {
    Logger.info(`Called updateQualityAlert`);
    const currentSerialNumberCustomerList: string[] = [];
    let serialNumberCustomersAdded = 0;
    let serialNumberCustomersFailed = 0;
    let serialNumberCustomersUpdated = 0;
    let serialNumberCustomersDeleted = 0;
    // get details of current alert
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);

    const filter = { alert_id: alertID };
    const currentAlertDetails = await connectionPool.partQualityAlertModel.findAll({
      where: filter,
    });
    Logger.info(`[${mspIDFromJWT}] updateQualityAlert: current details of alertID ${alertID} = ${JSON.stringify(currentAlertDetails)}`);
    currentAlertDetails.forEach(async (alert: QualityAlert) => {
      currentSerialNumberCustomerList.push(alert.serial_number_customer);
    });
    // compare the new list with the current list in the  alert table
    const serialNumberCustomerListToRemove: string[] = currentSerialNumberCustomerList.filter(item => serialNumberCustomerList.indexOf(item) < 0);
    const serialNumberCustomerListToAdd: string[] = serialNumberCustomerList.filter(item => currentSerialNumberCustomerList.indexOf(item) < 0);
    const serialNumberCustomerListToUpdate: string[] = serialNumberCustomerList.filter(value => currentSerialNumberCustomerList.includes(value));

    Logger.debug(`[${mspIDFromJWT}] updateQualityAlert: serialNumberCustomerList to remove = ${JSON.stringify(serialNumberCustomerListToRemove)}`);
    Logger.debug(`[${mspIDFromJWT}] updateQualityAlert: serialNumberCustomerList to add = ${JSON.stringify(serialNumberCustomerListToAdd)}`);
    Logger.debug(`[${mspIDFromJWT}] updateQualityAlert: serialNumberCustomerList to update = ${JSON.stringify(serialNumberCustomerListToUpdate)}`);
    // remove the serialNumberCustomer which is not present in the updated list
    if (serialNumberCustomerListToRemove.length > 0) {
      Logger.debug(`[${mspIDFromJWT}] updateQualityAlert: deleted the serialNumberCustomers`);
      const deleteResponse = await this.deleteSerialNumberCustomer(serialNumberCustomerListToRemove, alertID, mspIDFromJWT);
      serialNumberCustomersDeleted = deleteResponse.affectedTransactions;
    }
    // Update the details of current alerts of serialNumberCustomer in alert table
    if (serialNumberCustomerListToUpdate.length > 0) {
      // Update the event details
      await this.updateEventDetails(alertID, qualityType, mspIDFromJWT);
      Logger.debug(`[${mspIDFromJWT}] updateQualityAlert: update the serialNumberCustomers`);
      const updateResponse = await this.updateQualityAlertDetails(alertID, serialNumberCustomerListToUpdate, qualityType, qualityAlert, mspIDFromJWT);
      serialNumberCustomersUpdated = updateResponse.affectedTransactions;
    }

    // add new serialNumberCustomer to the alert
    if (serialNumberCustomerListToAdd.length > 0) {
      const serialNumberCustomerListAdded = await this.createQualityAlert(
        alertID,
        serialNumberCustomerListToAdd,
        qualityType,
        qualityAlert,
        comment,
        alertFlow,
        mspIDFromJWT,
      );
      Logger.debug(`[${mspIDFromJWT}] updateQualityAlert: serialNumberCustomerListAdded = ${JSON.stringify(serialNumberCustomerListAdded)}`);
      serialNumberCustomersFailed = serialNumberCustomerListAdded.data.failedSerialNumberCustomers;
      serialNumberCustomersAdded = serialNumberCustomerListAdded.data.processedSerialNumberCustomers;
    }

    return {
      status: 200,
      data: {
        alertID,
        qualityType,
        qualityAlert,
        serialNumberCustomersAdded,
        serialNumberCustomersFailed,
        serialNumberCustomersUpdated,
        serialNumberCustomersDeleted,
      },
    };
  }
  /**
   *
   *
   * @param {*} [filter={}]
   * @param {string} mspIDFromJWT
   * @return {*}
   * @memberof QualityAlertMgmtClient
   */
  async getAllQualityAlert(filter: any = {}, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] Called getQualityAlertDetails`);
    Logger.info(`[${mspIDFromJWT}] filter = ${JSON.stringify(filter)}`);
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
    return await connectionPool.partQualityAlertModel.findAll({
      where: filter,
    });
  }
  /**
   *
   *
   * @param {*} [filter={}]
   * @param {string} mspIDFromJWT
   * @return {*}
   * @memberof QualityAlertMgmtClient
   */
  async getAllEventAlert(filter: any = {}, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] Called getAllEventAlert`);
    Logger.info(`[${mspIDFromJWT}] filter = ${JSON.stringify(filter)}`);
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
    return await connectionPool.eventModel.findAll({
      where: filter,
    });
  }

  /**
   *
   *
   * @param {string} qualityType
   * @param {string} mspIDFromJWT
   * @memberof QualityAlertMgmtClient
   */
  async getEventWithQualityTypeAndStatus(qualityType: string, status: string, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] Called getEventWithQualityTypeAndStatus`);
    Logger.info(`[${mspIDFromJWT}]getEventWithQualityTypeAndStatus: qualityType = ${qualityType} status = ${status}`);
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
    const filter = { event_type: qualityType, event_status: status };
    return await connectionPool.eventModel.findAll({
      where: filter,
    });
  }
  /**
   *
   *
   * @param {string} alertID
   * @param {string} serialNumberCustomer
   * @param {string} status
   * @param {string} mspIDFromJWT
   * @return {*}
   * @memberof QualityAlertMgmtClient
   */
  async getQualityAlertDetailWithStatus(alertID: string, serialNumberCustomer: string, status: string, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] Called getQualityAlertDetailWithStatus`);
    Logger.info(
      `[${mspIDFromJWT}]  getQualityAlertDetailWithStatus: serialNumberCustomer = ${serialNumberCustomer} & status = ${status} alertID = ${alertID}`,
    );
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
    const filter = { alert_id: alertID, serial_number_customer: serialNumberCustomer, status };
    return await connectionPool.partQualityAlertModel.findAll({
      where: filter,
    });
  }

  /**
   *
   *
   * @param {string} serialNumberCustomer
   * @param {string} mspIDFromJWT
   * @return {*}
   * @memberof QualityAlertMgmtClient
   */
  async getQualityAlertDetails(serialNumberCustomer: string, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] Called getQualityAlertDetails`);
    Logger.info(`[${mspIDFromJWT}]  getQualityAlertDetails: serialNumberCustomer = ${serialNumberCustomer} `);
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
    const filter = { serial_number_customer: serialNumberCustomer };
    return await connectionPool.partQualityAlertModel.findAll({
      where: filter,
    });
  }
  /**
   *
   *
   * @param {string} alertID
   * @param {string} mspIDFromJWT
   * @return {*}
   * @memberof QualityAlertMgmtClient
   */
  async getQualityAlertDetailsWithAlertID(alertID: string, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] Called getQualityAlertDetailsWithAlertID`);
    Logger.info(`[${mspIDFromJWT}]  getQualityAlertDetailsWithAlertID: alertID = ${alertID}`);
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
    const filter = { alert_id: alertID };
    return await connectionPool.partQualityAlertModel.findAll({
      where: filter,
    });
  }
  /**
   *
   *
   * @param {Array<String>} serialNumberCustomers
   * @param {string} alertID
   * @param {string} mspIDFromJWT
   * @return {*}
   * @memberof QualityAlertMgmtClient
   */
  async deleteSerialNumberCustomer(serialNumberCustomers: string[], alertID: string, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] Called deleteSerialNumberCustomer`);
    Logger.info(`[${mspIDFromJWT}]  deleteSerialNumberCustomer: serialNumberCustomer = ${JSON.stringify(serialNumberCustomers)} `);
    Logger.info(`[${mspIDFromJWT}]  deleteSerialNumberCustomer: alertID = ${alertID} `);
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
    return {
      affectedTransactions: await connectionPool.partQualityAlertModel.update(
        { status: QualityAlertStatus.CANCELED },
        { where: { serial_number_customer: serialNumberCustomers, status: QualityAlertStatus.PENDING, alert_id: alertID } },
      ),
    };
  }
  /**
   *
   *
   * @param {string} alertID
   * @param {Array<String>} ids
   * @param {string} qualityType
   * @param {boolean} qualityAlert
   * @param {string} mspIDFromJWT
   * @return {*}
   * @memberof QualityAlertMgmtClient
   */
  async updateQualityAlertDetails(alertID: string, ids: string[], qualityType: string, qualityAlert: boolean, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] Called updateQualityAlertDetails`);
    Logger.info(`[${mspIDFromJWT}]  updateQualityAlertDetails: serialNumberCustomer = ${JSON.stringify(ids)}`);
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
    return {
      affectedTransactions: await connectionPool.partQualityAlertModel.update(
        { quality_type: qualityType, quality_alert: qualityAlert, status: QualityAlertStatus.PENDING },
        { where: { serial_number_customer: ids, alert_id: alertID, propagated: false, status: { [Op.not]: QualityAlertStatus.EXTERNAL } } },
      ),
    };
  }

  /**
   *
   *
   * @param alertIDs
   * @param {string} mspIDFromJWT
   * @memberof QualityAlertMgmtClient
   */
  async deleteQualityAlert(alertIDs: string[], mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] Called deleteQualityAlert`);
    Logger.info(`[${mspIDFromJWT}]  deleteQualityAlert: alertID = ${alertIDs}`);

    const currentSerialNumberCustomerList: string[] = [];
    let alertsDeleted = 0;
    let eventsDeleted = 0;
    // get details of current alert
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);

    if (alertIDs.length == 0) {
      return await returnFunction(`alertIDs list is empty `, ResponseStatus.VALIDATION_ERROR);
    }
    for await (let alertID of alertIDs) {
      Logger.info(`[${mspIDFromJWT}]  deleteQualityAlert: process alertID = ${alertID}`);
      const filter = { alert_id: alertID, status: EventStatus.PENDING };
      const currentAlertDetails = await connectionPool.partQualityAlertModel.findAll({
        where: filter,
      });
      Logger.info(`[${mspIDFromJWT}] deleteQualityAlert: current details of alertID ${alertID} = ${JSON.stringify(currentAlertDetails)}`);
      currentAlertDetails.forEach(async (alert: QualityAlert) => {
        currentSerialNumberCustomerList.push(alert.serial_number_customer);
      });
      // remove the serialNumberCustomer which is  present
      if (currentSerialNumberCustomerList.length > 0) {
        Logger.info(`[${mspIDFromJWT}] deleteQualityAlert: deleting the serialNumberCustomers`);
        const deleteResponse = await this.deleteSerialNumberCustomer(currentSerialNumberCustomerList, alertID, mspIDFromJWT);
        alertsDeleted = alertsDeleted + deleteResponse.affectedTransactions;
      }

      this.sendAlertHistory(alertID, mspIDFromJWT, AlertHistoryStatus.DELETED);

      // Update event status to deleted

      Logger.info(`[${mspIDFromJWT}] deleteQualityAlert: deleting the events`);
      const eventsDeletedResponse = await connectionPool.eventModel.update(
        { event_status: EventStatus.CANCELED },
        { where: { alert_id: alertID, event_status: EventStatus.PENDING } },
      );
      eventsDeleted = eventsDeleted + eventsDeletedResponse;

      //Update alert table and set status as committed
      await connectionPool.alertModel.update({ status: QualityAlertStatus.CANCELED }, { where: { alert_id: alertID } });
    }

    Logger.info(`[${mspIDFromJWT}] deleteQualityAlert: alertsDeleted = ${alertsDeleted}`);
    Logger.info(`[${mspIDFromJWT}] deleteQualityAlert: eventsDeleted = ${eventsDeleted}`);
    return {
      status: 200,
      data: {
        alertsDeleted,
        eventsDeleted,
      },
    };
  }

  /**
   *
   *
   * @param {string} alertIDs
   * @param {string} mspIDFromJWT
   * @memberof QualityAlertMgmtClient
   */
  async commitQualityAlert(alertIDs: string[], mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] Called commitQualityAlert`);
    Logger.info(`[${mspIDFromJWT}] commitQualityAlert: alertID = ${alertIDs}`);
    let partChainOrgs: string[] = [];

    let numberOfExternalEvent = 0;
    let numberOfBottomUpEvent = 0;
    let numberOfTopDownEvent = 0;
    if (alertIDs.length == 0) {
      return await returnFunction(`alertIDs list is empty `, ResponseStatus.VALIDATION_ERROR);
    }
    // get details of current alert
    const offChainDBClient = new OffChainDBClient();
    const qualityAlertProducer = new QualityAlertKafka();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
    const alertHistoryKafkaProducer = new AlertHistoryConsumer();

    // Fetch the list of all organization in PartChain
    const partChainOrgsResult = await this.processTransaction("getAllOrganisation", mspIDFromJWT, [{ mspID: mspIDFromJWT }], "eval");
    partChainOrgs = partChainOrgsResult[0].data;
    Logger.info(`[${mspIDFromJWT}] commitQualityAlert: partChainOrgs = ${JSON.stringify(partChainOrgs)}`);

    for await (let alertID of alertIDs) {
      Logger.info(`[${mspIDFromJWT}] commitQualityAlert: Commit Process for alertID = ${alertID}`);

      const eventDetails = await connectionPool.eventModel.findAll({
        where: {
          alert_id: alertID,
          propagated: false,
          [Op.or]: [{ event_status: QualityAlertStatus.PENDING }, { event_status: QualityAlertStatus.EXTERNAL }],
        },
      });

      Logger.info(`[${mspIDFromJWT}] commitQualityAlert: eventDetails = ${JSON.stringify(eventDetails)}`);

      for await (let event of eventDetails) {
        Logger.info(`[${mspIDFromJWT}] commitQualityAlert: event = ${JSON.stringify(event)}`);
        // Getting all serialNumberCustomers associated with the alert from the alert table
        const filter = {
          alert_id: event.alert_id,
          propagated: false,
          [Op.or]: [{ status: QualityAlertStatus.PENDING }, { status: QualityAlertStatus.EXTERNAL }],
          customer_oneid: event.event_target_company,
        };
        const currentAlertDetails = await connectionPool.partQualityAlertModel.findAll({
          where: filter,
        });

        Logger.debug(`[${mspIDFromJWT}] commitQualityAlert: currentEventDetails = ${JSON.stringify(event)}`);
        Logger.info(`[${mspIDFromJWT}] commitQualityAlert: current details of alertID ${alertID} = ${JSON.stringify(currentAlertDetails)}`);
        const mspIDofTargetCompany = await getMSPFromCustomerOneID(event.event_target_company);
        Logger.info(`[${mspIDFromJWT}] commitQualityAlert: mspIDofTargetCompany = ${mspIDofTargetCompany}`);
        // iterating through all the assets which are added to the alert
        if (partChainOrgs.includes(mspIDofTargetCompany) && mspIDofTargetCompany != mspIDFromJWT) {
          Logger.info(` [${mspIDFromJWT}] commitQualityAlert: customerOneID = ${event.event_target_company} is part of PartChain`);
          if (event.event_flow === AlertFlow.TOP_DOWN) {
            // Committing event for Top-Down
            await this.processCommitForTopDown(alertID, currentAlertDetails, event, mspIDFromJWT);
            numberOfTopDownEvent++;
          } else {
            // Committing event for Bottom-Up alert
            const response = await this.processCommitForPartChainInternal(
              alertID,
              currentAlertDetails,
              event,
              mspIDFromJWT,
              event.event_target_company,
            );
            Logger.debug(`[${mspIDFromJWT}] commitQualityAlert: response for processing the event = ${JSON.stringify(response)}`);
            numberOfBottomUpEvent++;

            this.sendAlertHistory(alertID, mspIDFromJWT, AlertHistoryStatus.FORWARDED);
          }
        } else {
          Logger.debug(` [${mspIDFromJWT}] commitQualityAlert: customerOneID = ${event.event_target_company} is not part of PartChain`);
          // Committing event outside PartChain
          const response = await this.processCommitForExternal(alertID, currentAlertDetails, event, mspIDFromJWT, event.event_target_company);
          Logger.debug(`[${mspIDFromJWT}] commitQualityAlert: response for processing the event for external = ${JSON.stringify(response)}`);
          numberOfExternalEvent++;
        }
        Logger.info(`[${mspIDFromJWT}] commitQualityAlert:  Get event details`);

        //TODO:check if it works fine
        const eventDetails = await this.getEventDetails(event.event_uid, mspIDFromJWT);
        Logger.info(`[${mspIDFromJWT}] commitQualityAlert: pushing data to ${mspIDofTargetCompany}`);
        qualityAlertProducer.send(eventDetails.data, mspIDofTargetCompany);

        // Getting the correct status for quality alert
        const newAlertStatus = event.event_flow === AlertFlow.TOP_DOWN ? QualityAlertStatus.DISTRIBUTED : QualityAlertStatus.COMMITTED;

        //Update alert table and set status as committed
        await connectionPool.alertModel.update({ status: newAlertStatus }, { where: { alert_id: alertID } });
      }
    }

    return {
      status: 200,
      data: {
        numberOfExternalEvent,
        numberOfBottomUpEvent,
        numberOfTopDownEvent,
      },
    };
  }

  /**
   *
   *
   * @param {string} alertID
   * @param {*} alertDetails
   * @param eventDetails
   * @param {string} mspIDFromJWT
   * @param {string} customerOneID
   * @return {*}
   * @memberof QualityAlertMgmtClient
   */
  async processCommitForPartChainInternal(alertID: string, alertDetails: any, eventDetails: any, mspIDFromJWT: string, customerOneID: string) {
    Logger.info(
      `[${mspIDFromJWT}] Called processCommitForPartChainInternal with alertID = ${alertID} alertDetails = ${JSON.stringify(
        alertDetails,
      )}  eventDetails = ${JSON.stringify(eventDetails)} mspIDFromJWT = ${mspIDFromJWT} customerOneID = ${customerOneID}`,
    );
    let numberOfAssetsProcessed = 0;
    let numberOfAssetsFailed = 0;
    let numberOfExternalAsset = 0;
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
    // Update the Quality Alert Table
    for await (let alert of alertDetails) {
      if (alert.status != QualityAlertStatus.EXTERNAL) {
        const asset = await this.getAssetDetail(alert.serial_number_customer, mspIDFromJWT);
        const result = asset.hasOwnProperty("data");
        Logger.info(`[${mspIDFromJWT}] processCommitForPartChainInternal: Result: "${result}"`);
        if (result) {
          Logger.debug(`[${mspIDFromJWT}] processCommitForPartChainInternal: Found asset: "${JSON.stringify(asset.data)}"`);
          Logger.debug(`[${mspIDFromJWT}] processCommitForPartChainInternal: eventDetails : "${JSON.stringify(eventDetails)}"`);
          // Add the exrta fields regarding the quality alert in  the custom fields
          asset.data.qualityStatus = alert.quality_alert ? "NOK" : "OK";
          asset.data.customFields.qualityAlert = alert.quality_alert;
          asset.data.customFields.qualityType = alert.quality_type;
          asset.data.customFields.alertID = alert.alert_id;
          asset.data.customFields.eventOrigin = eventDetails.event_origin;
          asset.data.customFields.eventType = eventDetails.event_type;
          asset.data.customFields.eventOriginCompany = eventDetails.event_origin_company;
          asset.data.customFields.eventTargetCompany = eventDetails.event_target_company;

          Logger.info(`[${mspIDFromJWT}] processCommitForPartChainInternal: customFields : "${JSON.stringify(asset.data.customFields)}"`);
          Logger.info(
            `[${mspIDFromJWT}] processCommitForPartChainInternal:  asset data before calling the update function: "${JSON.stringify(asset.data)}"`,
          );
          const update = await this.updateAsset(asset.data, mspIDFromJWT, false, true);
          Logger.info(`[${mspIDFromJWT}] processCommitForPartChainInternal: Ledger update request: "${JSON.stringify(update)}"`);
          const status = update.status === 200 ? QualityAlertStatus.COMMITTED : QualityAlertStatus.FAILED;
          const propagated = update.status === 200;
          // update the status of the serialNumberCustomer in the quality alert table
          // Update propagated field and status
          const alertTableResponse = await connectionPool.partQualityAlertModel.update(
            { propagated, status },
            { where: { serial_number_customer: alert.serial_number_customer, alert_id: alert.alert_id } },
          );

          Logger.info(
            `[${mspIDFromJWT}] processCommitForPartChainInternal: status = ${status} && propagated = ${propagated} alertTableResponse = ${alertTableResponse}`,
          );
          if (update.status === 200 && alertTableResponse > 0) {
            numberOfAssetsProcessed++;
            Logger.debug(`[${mspIDFromJWT}] processCommitForPartChainInternal: numberOfAssetsProcessed = ${numberOfAssetsProcessed}`);
          } else {
            numberOfAssetsFailed++;
            Logger.debug(`[${mspIDFromJWT}] processCommitForPartChainInternal: numberOfAssetsFailed = ${numberOfAssetsFailed}`);
          }
        }

        const eventOriginCompanyOneID = await getCustomerOneIDFromMSP(mspIDFromJWT);
        Logger.info(`[${mspIDFromJWT}] processCommitForPartChainInternal: eventOriginCompany= ${eventOriginCompanyOneID} `);
        // Update the event Table
        await connectionPool.eventModel.update(
          { propagated: true, event_status: EventStatus.COMMITTED },
          {
            where: {
              event_uid: alertID,
              event_origin_company: eventOriginCompanyOneID,
              event_target_company: customerOneID,
            },
          },
        );
      } else {
        // updating the external events as propagated = true

        Logger.info(
          `[${mspIDFromJWT}] processCommitForPartChainInternal: updating  propagated: true for external SNC = ${alert.serial_number_customer}`,
        );
        await connectionPool.partQualityAlertModel.update(
          { propagated: true },
          {
            where: {
              serial_number_customer: alert.serial_number_customer,
              alert_id: alert.alert_id,
              status: QualityAlertStatus.EXTERNAL,
            },
          },
        );
        numberOfExternalAsset++;

        const eventTargetCompanyOneID = await getCustomerOneIDFromMSP(mspIDFromJWT);
        Logger.info(`[${mspIDFromJWT}] processCommitForPartChainInternal: eventOriginCompany= ${eventTargetCompanyOneID} `);
        // Update the event Table
        await connectionPool.eventModel.update(
          { propagated: true },
          {
            where: {
              event_uid: alertID,
              event_status: EventStatus.EXTERNAL,
              event_target_company: eventTargetCompanyOneID,
            },
          },
        );
      }
    }

    const response = { alertID, numberOfAssetsProcessed, numberOfAssetsFailed, numberOfExternalAsset };
    return await returnFunction(JSON.stringify(response), ResponseStatus.SUCCESS);
  }
  /**
   *
   *
   * @param {string} alertID
   * @param {*} alertDetails
   * @param eventDetails
   * @param {string} mspIDFromJWT
   * @param {string} customerOneID
   * @memberof QualityAlertMgmtClient
   */
  async processCommitForExternal(alertID: string, alertDetails: any, eventDetails: any, mspIDFromJWT: string, customerOneID: string) {
    Logger.info(`[${mspIDFromJWT}] Called processCommitForExternal`);

    let numberOfAssetsProcessed = 0;
    let numberOfAssetsFailed = 0;
    let numberOfExternalAsset = 0;
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);

    const eventOriginCompanyOneID = await getCustomerOneIDFromMSP(mspIDFromJWT);
    // Update the Quality Alert Table
    for await (let alert of alertDetails) {
      if (alert.status != QualityAlertStatus.EXTERNAL) {
        //update the quality status of the current asset

        const asset = await this.getAssetDetail(alert.serial_number_customer, mspIDFromJWT);
        const result = asset.hasOwnProperty("data");
        Logger.info(`[${mspIDFromJWT}] processCommitForExternal: Result: "${result}"`);
        if (result) {
          Logger.debug(`[${mspIDFromJWT}] processCommitForExternal: Found asset: "${JSON.stringify(asset.data)}"`);
          Logger.debug(`[${mspIDFromJWT}] processCommitForExternal: eventDetails : "${JSON.stringify(eventDetails)}"`);
          // New quality status of the asset
          asset.data.qualityStatus = alert.quality_alert ? "NOK" : "OK";
          // Adding Quality Type information
          asset.data.customFields.qualityAlert = alert.quality_alert;
          asset.data.customFields.qualityType = alert.quality_type;
          asset.data.customFields.alertID = alert.alert_id;
          asset.data.customFields.eventOrigin = eventDetails.event_origin;
          asset.data.customFields.eventType = eventDetails.event_type;
          asset.data.customFields.eventOriginCompany = eventDetails.event_origin_company;
          asset.data.customFields.eventTargetCompany = eventDetails.event_target_company;

          // update the asset details
          await this.updateAsset(asset.data, mspIDFromJWT, false, true);
          // update the alert as committed
          await connectionPool.partQualityAlertModel.update(
            { propagated: true, status: QualityAlertStatus.COMMITTED },
            { where: { serial_number_customer: alert.serial_number_customer, alert_id: alert.alert_id } },
          );
          numberOfAssetsProcessed++;
        }

        //  Invoke the API to notify IDS connector
        if (customerOneID != "") {
          // Update the event Table
          await connectionPool.eventModel.update(
            { propagated: true, event_status: EventStatus.EVENT_EXTERNAL_NOTIFY_IDS },
            {
              where: {
                event_uid: alertID,
                event_origin_company: eventOriginCompanyOneID,
                event_target_company: customerOneID,
              },
            },
          );
        } else {
          Logger.debug(`[${mspIDFromJWT}] processCommitForExternal: eventOriginCompany= ${eventOriginCompanyOneID} `);
          // Update the event Table
          await connectionPool.eventModel.update(
            { propagated: true, event_status: EventStatus.COMMITTED },
            {
              where: {
                event_uid: alertID,
                event_origin_company: eventOriginCompanyOneID,
                event_target_company: customerOneID,
              },
            },
          );
        }
      } else {
        await connectionPool.partQualityAlertModel.update(
          { propagated: true },
          {
            where: {
              serial_number_customer: alert.serial_number_customer,
              alert_id: alert.alert_id,
              status: QualityAlertStatus.EXTERNAL,
            },
          },
        );

        // Update the event Table for the external event received
        await connectionPool.eventModel.update(
          { propagated: true },
          {
            where: {
              event_uid: alertID,
              event_target_company: eventOriginCompanyOneID,
            },
          },
        );
        numberOfExternalAsset++;
      }
    }

    const response = { alertID, numberOfAssetsProcessed, numberOfAssetsFailed, numberOfExternalAsset };
    return await returnFunction(JSON.stringify(response), ResponseStatus.SUCCESS);
  }
  /**
   *
   *
   * @param {string} eventUID
   * @param {string} eventTimestamp
   * @param {string} eventOriginApp
   * @param {string} eventOriginCompany
   * @param {string} eventTargetCompany
   * @param {string} eventType
   * @param {any[]} eventBody
   * @param {any[]} comments
   * @param {string} eventFlow
   * @param {string} mspIDFromJWT
   * @return {*}
   * @memberof QualityAlertMgmtClient
   */
  async consumeQualityAlert(
    eventUID: string,
    alertId: string,
    eventTimestamp: string,
    eventOriginApp: string,
    eventOriginCompany: string,
    eventTargetCompany: string,
    eventType: string,
    eventBody: any[],
    message: string,
    eventFlow: string,
    mspIDFromJWT: string,
    originPartnerName: string,
  ) {
    Logger.info(`[${mspIDFromJWT}] Called consumeQualityAlert`);
    Logger.info(`[${mspIDFromJWT}] consumeQualityAlert: message = ${message}`);
    Logger.info(
      `[${mspIDFromJWT}] consumeQualityAlert: alertId = ${alertId} eventUID = ${eventUID}  eventTimestamp = ${eventTimestamp} eventOriginApp= ${eventOriginApp} eventOriginCompany =${eventOriginCompany} eventTargetCompany = ${eventTargetCompany}  eventType = ${eventType} eventBody = ${JSON.stringify(
        eventBody,
      )} mspIDFromJWT = ${mspIDFromJWT}`,
    );

    const childAlerts: Array<QualityAlert> = [];
    const parentAlerts: Array<QualityAlert> = [];
    const eventList: Array<Event> = [];
    const commentsList: Array<CommentModel> = [];
    const offChainDBClient = new OffChainDBClient();
    const alertList: Array<AlertModel> = [];
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
    // New event ID created for the affect Parent Parts
    const parentAlert = await generateID(16);
    const partNames = Object.create({});
    const companyOneID = await getCustomerOneIDFromMSP(mspIDFromJWT);
    const organizationListForEvent: Map<string, string> = new Map();
    const providerMSP = mspIDFromJWT.split("-");
    const mspID = providerMSP.length > 1 ? providerMSP[1] : providerMSP[0];
    let hasCustomer = false;

    if (eventTargetCompany !== companyOneID) {
      return returnFunction(
        `Event is addressed to different target Company ${eventTargetCompany}. Hence, rejecting the event request. Please use CompanyOneID of ${mspID} as  eventTargetCompany. `,
        ResponseStatus.PERMISSION_DENIED,
      );
    }

    const eventFilter = {
      alert_id: alertId,
      event_origin_company: eventOriginCompany,
      event_target_company: eventTargetCompany,
    };
    let eventData = await connectionPool.eventModel.findAll({
      where: eventFilter,
    });

    Logger.info(`[${mspIDFromJWT}] consumeQualityAlert: eventData = ${JSON.stringify(eventData)}`);
    if (eventData.length > 0) {
      return {
        status: 403,
        data: `Alert already exist with id ${alertId} from  ${eventOriginCompany} to ${eventTargetCompany}. Hence rejecting the event. Please use a different eventUID`,
      };
    }
    //Create an event for the current request

    for await (let event of eventBody) {
      Logger.info(`[${mspIDFromJWT}]  consumeQualityAlert = ${JSON.stringify(event)}`);
      const alertFilter = {
        alert_id: alertId,
        serial_number_customer: event.customerUniqueID,
        child_serial_number_customer: "",
      };
      let childData = await connectionPool.partQualityAlertModel.findAll({
        where: alertFilter,
      });
      //TODO: Validate if the asset "qualityAlert" = "true" before creating the alert
      Logger.info(`[${mspIDFromJWT}] consumeQualityAlert: childData = ${JSON.stringify(childData)}`);
      if (childData.length == 0) {
        const childCompanyOneID = await getCustomerOneIDFromMSP(mspIDFromJWT);
        const childPartAlert = new PartsAlert(
          alertId,
          event.customerUniqueID,
          "",
          event.qualityAlert.QualityType,
          event.qualityAlert.QualityAlert,
          eventOriginCompany,
          false,
          eventOriginApp,
          QualityAlertStatus.EXTERNAL,
          childCompanyOneID,
          { qualityType: "OK", qualityAlert: false },
          "",
          "",
          "",
          "",
          "",
        );
        childAlerts.push(childPartAlert);
        // Check if there exist any parent assets for the received events only in case of Bottom-up
        const parentAsset: any[] =
          eventFlow === AlertFlow.TOP_DOWN
            ? []
            : await offChainDBClient.getParentFromRelationshipByChildSerialNumberCustomer(event.customerUniqueID, mspIDFromJWT);

        Logger.debug(`[${mspIDFromJWT}]  consumeQualityAlert parentAsset = ${JSON.stringify(parentAsset)}  `);
        if (parentAsset.length > 0) {
          for await (let parent of parentAsset) {
            Logger.debug(`[${mspIDFromJWT}] consumeQualityAlert: Parent affected = ${JSON.stringify(parent)} `);
            //Check if the alert exists for parent SNC and only add  if it doesn't exist
            const alertFilter = {
              //   alert_id: eventUID,
              serial_number_customer: parent.parent_serial_number_customer,
              status: QualityAlertStatus.PENDING,
            };
            let parentAssetCheck = await connectionPool.partQualityAlertModel.findAll({
              where: alertFilter,
            });

            Logger.info(`[${mspIDFromJWT}] consumeQualityAlert: parentAssetCheck = ${JSON.stringify(parentAssetCheck)} `);
            Logger.info(`[${mspIDFromJWT}] consumeQualityAlert: parentAssetCheck.length = ${JSON.stringify(parentAssetCheck.length)} `);
            if (parentAssetCheck.length == 0) {
              const parentData = await offChainDBClient.getAssetDetail(parent.parent_serial_number_customer, 0, mspIDFromJWT);
              Logger.info(`[${mspIDFromJWT}] consumeQualityAlert: checking for parent = ${JSON.stringify(parent)} `);
              Logger.info(`[${mspIDFromJWT}] consumeQualityAlert: checking for parentData = ${JSON.stringify(parentData)} `);
              if (!partNames.hasOwnProperty(parentData.partNameManufacturer)) {
                partNames[parentData.partNameManufacturer] = [];
                hasCustomer = parentData.customFields.customeroneid === "" ? false : true;
              }
              Logger.info(`[${mspIDFromJWT}] consumeQualityAlert:  partNames before  ${JSON.stringify(partNames)}`);
              partNames[parentData.partNameManufacturer].push(parentData.productionDateGmt);
              //Creating the Parent Object

              const parentCurrentQualityType = parentData.customFields.hasOwnProperty("qualitytype") ? parentData.customFields.qualitytype : "OK";

              const parentPart: PartsAlert = new PartsAlert(
                parentAlert,
                parent.parent_serial_number_customer,
                event.customerUniqueID,
                event.qualityAlert.QualityType,
                event.qualityAlert.QualityAlert,
                parent.parent_mspid,
                false,
                "PartChain",
                QualityAlertStatus.PENDING,
                parentData.customFields.customeroneid,
                {
                  qualityType: parentCurrentQualityType,
                  qualityAlert: parentData.customFields.qualityalert,
                },
                parentData.partNameManufacturer,
                parentData.partNameManufacturer,
                "",
                "",
                originPartnerName,
              );

              const parentAssetUnqinessCheck = parentAlerts.find(
                ({ serial_number_customer }) => serial_number_customer === parent.parent_serial_number_customer,
              );
              Logger.info(`[${mspIDFromJWT}] consumeQualityAlert: parentAssetUnqinessCheck = ${parentAssetUnqinessCheck}`);
              if (parentAssetUnqinessCheck === undefined) {
                parentAlerts.push(parentPart);
                organizationListForEvent.set(parentData.customFields.customeroneid, parentData.customFields.businesspartnername);
              }
            } else {
              // Check the current quality status of the parent asset and compare if the received quality alerts has higher precedence  [CRITICAL> MAJOR> MINOR ]
              //1. Get current details of the parent asset in the pending state
              //2. Check if the new incoming quality alert got higher precedence
              //3. If new quality alert has higher precedence, mark the old quality alert as deleted and create the quality alert for the parent asset with status pending

              const currentQualityAlertWeightage = await getWeightageByQualityType(parentAssetCheck[0].quality_type);
              const newQualityAlertWeightage = await getWeightageByQualityType(event.qualityAlert.QualityType);

              Logger.info(`[${mspIDFromJWT}] consumeQualityAlert: currentQualityAlertWeightage = ${JSON.stringify(currentQualityAlertWeightage)} `);
              Logger.info(`[${mspIDFromJWT}] consumeQualityAlert: newQualityAlertWeightage = ${JSON.stringify(newQualityAlertWeightage)} `);
              if (newQualityAlertWeightage > currentQualityAlertWeightage) {
                Logger.info(
                  `[${mspIDFromJWT}] consumeQualityAlert: The weightage of new quality_alert is greater, So updating the parent asset alertID and qualityStatus to the latest`,
                );

                await connectionPool.partQualityAlertModel.update(
                  { quality_type: event.qualityAlert.QualityType, alert_id: eventUID, child_serial_number_customer: event.customerUniqueID },
                  { where: { serial_number_customer: parent.parent_serial_number_customer, status: QualityAlertStatus.PENDING } },
                );
              }
            }
          }
        }
      }
    }

    if (childAlerts.length > 0) {
      const childEvent = new Events(
        eventUID,
        alertId,
        eventOriginApp,
        eventOriginCompany,
        eventTargetCompany,
        eventType,
        EventStatus.EXTERNAL,
        eventFlow,
        "",
        false,
        originPartnerName,
      );
      eventList.push(childEvent);

      const childCommentId = await generateID(32);
      const childCommentObj: Comments = new Comments(childCommentId, alertId, eventOriginCompany, eventTargetCompany, message, eventOriginCompany);
      commentsList.push(childCommentObj);

      // Adding the received alert to the list
      alertList.push({
        alert_id: alertId,
        status: QualityAlertStatus.EXTERNAL,
        alert_flow: eventFlow,
        related_alert: "",
      });
      //Insert data to the alert Table
      const result = await connectionPool.partQualityAlertModel.bulkCreate(childAlerts);
      Logger.debug(`[${mspIDFromJWT}] consumeQualityAlert: result  for child assets = ${JSON.stringify(result)}`);
    }

    Logger.info(`[${mspIDFromJWT}] consumeQualityAlert: eventList = ${JSON.stringify(eventList)}`);

    // Process the parent asset details only in the case of bottom-up alert.
    if (parentAlerts.length > 0 && eventFlow === AlertFlow.BOTTOM_UP) {
      for await (let org of organizationListForEvent) {
        Logger.debug(`[${mspIDFromJWT}] consumeQualityAlert: eventOriginCompany= ${companyOneID} `);

        const parentEventId = await generateID(32);

        const parentEventObj: Events = new Events(
          parentEventId,
          parentAlert,
          "PartChain",
          companyOneID,
          org[0],
          eventType,
          EventStatus.PENDING,
          eventFlow,
          eventUID,
          false,
          org[1],
        );
        eventList.push(parentEventObj);

        //Adding comments while creating new events

        const parentCommentId = await generateID(32);
        const parentComment = new Comments(parentCommentId, parentAlert, companyOneID, org[0], "Automatic event", companyOneID);
        commentsList.push(parentComment);

        //Insert data to the alert Table
        const result = await connectionPool.partQualityAlertModel.bulkCreate(parentAlerts);
        Logger.debug(`[${mspIDFromJWT}] consumeQualityAlert: result  for child parent = ${JSON.stringify(result)}`);
      }
      // Adding the received alert to the list
      alertList.push({
        alert_id: parentAlert,
        status: QualityAlertStatus.CREATED,
        alert_flow: eventFlow,
        related_alert: alertId,
      });
    }

    // Insert alert data to alert table
    if (alertList.length > 0) {
      const alertResponse = await connectionPool.alertModel.bulkCreate(alertList);
      Logger.debug(`[${mspIDFromJWT}] consumeQualityAlert: event result = ${JSON.stringify(alertResponse)}`);
    }

    //Insert event data to the events Table
    if (eventList.length > 0) {
      const eventResponse = await connectionPool.eventModel.bulkCreate(eventList);
      Logger.debug(`[${mspIDFromJWT}] consumeQualityAlert: event result = ${JSON.stringify(eventResponse)}`);
    }

    //Insert data to the comment Table
    if (commentsList.length > 0) {
      Logger.info(`[${mspIDFromJWT}] consumeQualityAlert: creating comments = ${JSON.stringify(commentsList)}`);
      const result = await connectionPool.commentModel.bulkCreate(commentsList);
      Logger.debug(`[${mspIDFromJWT}] consumeQualityAlert: event result = ${JSON.stringify(result)}`);
    }

    if (eventType == QualityAlertType.LIFE_THREATENING) {
      const orgDetails = await getContactInfo(companyOneID);
      if (orgDetails.name != null) {
        const toAddress = orgDetails.email;
        const subject = `LIFE-THREATENING alert received from ${originPartnerName} `;
        let componentDetails = "";
        for (const partDetails in partNames) {
          Logger.info(`[${mspIDFromJWT}] consumeQualityAlert: partName details ${partDetails}: ${partNames[partDetails]} `);
          const { maxDate, minDate } = await getMinAndMaxDate(partNames[partDetails]);
          componentDetails =
            maxDate > minDate
              ? componentDetails +
                `<li><b>${partNames[partDetails].length}x ${partDetails}</b>: From${minDate.toUTCString()} to ${maxDate.toUTCString()}</li>`
              : componentDetails +
                `<li><b>${partNames[partDetails].length}​x ${partDetails}​</b>: ${minDate.toUTCString()}​ 
          </li> `;
        }

        Logger.info(`[${mspIDFromJWT}] consumeQualityAlert: componentDetails = ${componentDetails}`);

        let emailObj = readFileSync(defaults.alertHtml);
        let htmlTemplate = emailObj.toString();
        const userPersonalName = /\{{userPersonalName}}/g;
        const supplerName = /\{{supplier}}/g;
        const url = /\{{partChainUrl}}/g;
        const componentSerialNumberList = /\{{componentNumberedListItem}}/g;
        const targetForwardAlertDate = /\{{targetForwardAlertDate}}/g;
        Logger.info(`[${mspIDFromJWT}] consumeQualityAlert: hasCustomer = ${hasCustomer} `);
        const customerMessage =
          `<b>${new Date(new Date().getTime() + defaults.cronjob.status.qualityAlert.timeInterval * 2 * 60000).toUTCString()} </b> ,` +
          (hasCustomer
            ? ` the alert will be automatically forwarded to your customer.`
            : ` the status will be committed for the parts mentioned above.`);

        Logger.debug(`[${mspIDFromJWT}] consumeQualityAlert: customerMessage = ${customerMessage} `);
        htmlTemplate = htmlTemplate
          .replace(supplerName, eventOriginCompany)
          .replace(url, orgDetails.url)
          .replace(userPersonalName, orgDetails.name)
          .replace(componentSerialNumberList, componentDetails)
          .replace(targetForwardAlertDate, customerMessage);
        Logger.info(`[${mspIDFromJWT}] consumeQualityAlert: Sending email eventOriginCompany ${eventOriginCompany}`);
        Logger.info(`[${mspIDFromJWT}] consumeQualityAlert: Sending email to ${orgDetails.email}`);
        await sendEmail(toAddress, subject, htmlTemplate);
      } else {
        Logger.error(`[${mspIDFromJWT}] consumeQualityAlert: contact details not found for ${companyOneID}`);
      }
    }

    return {
      status: 200,
      data: {
        alertID: parentAlert,
        numberOfChildQualityAlert: childAlerts.length,
        numberOfParentQualityAlert: parentAlerts.length,
      },
    };
  }

  /**
   *
   *
   * @param {Array<Event>} eventList
   * @param {string} eventOriginCompany
   * @param {string} eventTargetCompany
   * @param {string} eventUID
   * @param mspIDFromJWT
   * @return {*}
   * @memberof QualityAlertMgmtClient
   */
  async findEvent(eventList: Array<Event>, eventOriginCompany: string, eventTargetCompany: string, eventUID: string, mspIDFromJWT: string) {
    Logger.info(
      `[${mspIDFromJWT}] findEvent: eventList = ${JSON.stringify(
        eventList,
      )} eventOriginCompany = ${eventOriginCompany}  eventTargetCompany = ${eventTargetCompany}  eventUID = ${eventUID} `,
    );

    for await (let eventCheck of eventList) {
      Logger.debug(
        `[${mspIDFromJWT}] findEvent: event check = eventOriginCompany = ${eventCheck.event_origin_company}  eventTargetCompany = ${eventCheck.event_target_company}  eventUID = ${eventCheck.event_uid} `,
      );
      if (
        eventCheck.event_origin_company === eventOriginCompany &&
        eventCheck.event_target_company === eventTargetCompany &&
        eventCheck.event_uid === eventUID
      ) {
        Logger.info(`[${mspIDFromJWT}] findEvent:  Event already exist`);
        return true;
      }
    }
    return false;
  }

  /**
   *
   *
   * @param {string} alertID
   * @param {string} mspIDFromJWT
   * @param customerOneID
   * @param originCompany
   * @memberof QualityAlertMgmtClient
   */
  async getEventDetails(alertID: string, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] Called getEventDetails`);

    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
    let assetInfo: EventBody[] = [];
    let comments: CommentBody[] = [];
    const eventFilter = {
      event_uid: alertID,
    };
    let eventData = await connectionPool.eventModel.findAll({
      where: eventFilter,
    });

    const eventInfo = eventData[0] as Event;

    Logger.info(`[${mspIDFromJWT}] getEventDetails: eventInfo  = ${JSON.stringify(eventInfo)}`);
    // get corresponding data from the alert table
    const alertFilter = { alert_id: eventInfo.alert_id };
    const alertData = await connectionPool.partQualityAlertModel.findAll({
      where: alertFilter,
    });
    for await (let alert of alertData) {
      let assetData: EventBody = {
        customerUniqueID: alert.serial_number_customer,
        qualityAlert: { QualityAlert: alert.quality_alert, QualityType: alert.quality_type },
      };
      assetInfo.push(assetData);
    }
    Logger.info(`[${mspIDFromJWT}] getEventDetails: assetInfo = ${JSON.stringify(assetInfo)}`);

    //Get comments for specific event

    const commentFilter = { alert_id: eventInfo.alert_id };
    const commentData = await connectionPool.commentModel.findAll({
      where: commentFilter,
    });

    Logger.info(`[${mspIDFromJWT}] getEventDetails: commentData = ${JSON.stringify(commentData)}`);
    for await (let comment of commentData) {
      let commentInfo: CommentBody = {
        message: comment.alert_message,
        originCompany: comment.alert_origin_company,
        targetCompany: comment.alert_target_company,
        company: comment.company_name,
        timestamp: comment.createdAt,
      };
      comments.push(commentInfo);
    }
    Logger.info(`[${mspIDFromJWT}] getEventDetails: comments = ${JSON.stringify(comments)}`);

    let eventObj: EventModel = {
      eventUID: eventInfo.event_uid,
      alertId: eventInfo.alert_id,
      eventOriginApp: eventInfo.event_origin,
      eventTimestamp: new Date().toISOString(),
      eventOriginCompany: eventInfo.event_origin_company,
      eventTargetCompany: eventInfo.event_target_company,
      eventType: eventInfo.event_type,
      eventBody: assetInfo,
      eventStatus: eventInfo.event_status,
      comments: comments,
      eventFlow: eventInfo.event_flow,
      relatedEvent: eventInfo.event_relation,
      originPartnerName: eventInfo.origin_partner_name,
    };
    Logger.info(`[${mspIDFromJWT}] getEventDetails: eventDetails after adding eventContent = ${JSON.stringify(eventObj)}`);

    return returnFunction(JSON.stringify(eventObj), ResponseStatus.SUCCESS);
  }
  /**
   *
   *
   * @memberof QualityAlertMgmtClient
   */
  async getIDSEventData(mspIDFromJWT: string, eventTargetCompany: string) {
    Logger.info(`Called getIDSEventData`);
    let eventArray: any[] = [];
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
    //Get all events for the eventID for Mercedes status is notified_ids
    const filter = {
      event_status: "notified_ids",
      event_target_company: eventTargetCompany,
    };
    let eventDetails = await this.getAllEventAlert(filter, mspIDFromJWT);
    const eventObj = JSON.parse(eventDetails.data);
    Logger.info(`[${mspIDFromJWT}] getIDSEventData: eventDetails = ${JSON.stringify(eventDetails)}`);
    if (eventObj.length > 0) {
      for await (let event of eventObj) {
        const eventData = await this.getEventDetails(event.event_uid, mspIDFromJWT);
        Logger.info(`[${mspIDFromJWT}] getIDSEventData: eventData = ${eventData.data}`);
        eventArray.push(JSON.parse(eventData.data));
        // update the status of the event to send_data_to_IDS
        await connectionPool.eventModel.update(
          { event_status: EventStatus.EVENT_EXTERNAL_SEND_IDS },
          {
            where: {
              event_uid: event.event_uid,
              event_origin_company: event.event_origin_company,
              event_target_company: event.event_target_company,
            },
          },
        );
      }
    }
    return returnFunction(JSON.stringify({ eventArray }), ResponseStatus.SUCCESS);
  }

  /**
   *
   *
   * @param {string} alertID
   * @param {string} mspIDFromJWT
   * @memberof QualityAlertMgmtClient
   */
  async getAlertDetails(alertId: string, alertFlow: string, relatedAlertID: string, status: string, mspIDFromJWT: string) {
    Logger.debug(`[${mspIDFromJWT}] getAlertDetails: called`);
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
    let qualityAlertObj: QualityAlertModel = Object.create({});
    let partsAffected: QualityAlertPartsModel[] = [];
    let events: QualityAlertEventModel[] = [];
    let comments: CommentBody[] = [];
    let alertHistories: AlertHistoryModel[] = [];
    // Filter  based on alertId
    const filter = { alert_id: alertId };
    // Get all events for given alertId
    let eventData = await connectionPool.eventModel.findAll({
      where: filter,
    });
    Logger.debug(`[${mspIDFromJWT}] getAlertDetails: eventInfo  = ${JSON.stringify(eventData)}`);
    // get relevant details for events
    for await (let event of eventData) {
      let eventObj: QualityAlertEventModel = {
        eventOriginCompany: event.event_origin_company,
        eventTargetCompany: event.event_target_company,
        eventUid: event.event_uid,
        eventFlow: event.event_flow,
        propagated: event.propagated,
        originPartnerName: event.origin_partner_name,
      };
      events.push(eventObj);
    }

    Logger.debug(`[${mspIDFromJWT}] getAlertDetails: quality-alert events  = ${JSON.stringify(events)}`);

    // Get all alerts for the parts for the given alertId
    const partsData = await connectionPool.partQualityAlertModel.findAll({
      where: filter,
    });
    Logger.debug(`[${mspIDFromJWT}] getAlertDetails: partsData  = ${JSON.stringify(partsData)}`);
    // Get relevant details for parts
    for await (let part of partsData) {
      let partObj: QualityAlertPartsModel = {
        alertId: part.alert_id,
        serialNumberCustomer: part.serial_number_customer,
        childSerialNumberCustomer: part.child_serial_number_customer,
        qualityType: part.quality_type,
        qualityAlert: part.quality_alert,
        mspid: part.mspid,
        propagated: part.propagated,
        appName: part.app_name,
        status: part.status,
        customerOneid: part.customer_oneid,
        history: part.history,
        partNameManufacturer: part.part_name_manufacturer,
        partNumberManufacturer: part.part_number_manufacturer,
        childPartNameManufacturer: part.child_part_name_manufacturer,
        childPartNumberManufacturer: part.child_part_number_manufacturer,
        childCustomerOneid: part.child_customer_oneid,
        createdAt: part.createdAt,
        updatedAt: part.updatedAt,
      };
      partsAffected.push(partObj);
    }

    Logger.debug(`[${mspIDFromJWT}] getAlertDetails: quality-alert partsAffected  = ${JSON.stringify(partsAffected)}`);
    // Get all the comments for the given alertId
    const commentData = await connectionPool.commentModel.findAll({
      where: filter,
    });
    Logger.debug(`[${mspIDFromJWT}] getAlertDetails: commentData  = ${JSON.stringify(commentData)}`);
    // Get all comments for the given alert

    for await (let comment of commentData) {
      let commentObj: CommentBody = {
        message: comment.alert_message,
        originCompany: comment.alert_origin_company,
        targetCompany: comment.alert_target_company,
        company: comment.company_name,
        timestamp: comment.createdAt,
      };
      comments.push(commentObj);
    }
    Logger.debug(`[${mspIDFromJWT}] getAlertDetails: quality-alert comments  = ${JSON.stringify(comments)}`);

    // Get all the alert History for the given alertId
    const alertHistoryData = await connectionPool.alertHistoryModel.findAll({
      where: filter,
    });
    Logger.debug(`[${mspIDFromJWT}] getAlertDetails: alertHistoryData  = ${JSON.stringify(alertHistoryData)}`);
    // Get all alert History for the given alert

    for await (let alertHistory of alertHistoryData) {
      let alertHistoryObj: AlertHistoryModel = {
        alertHistoryOriginCompany: alertHistory.alertHistoryOriginCompany,
        alertHistoryTargetCompany: alertHistory.alertHistoryTargetCompany,
        alertHistoryType: alertHistory.alertHistoryType,
        timestamp: alertHistory.createdAt,
      };
      alertHistories.push(alertHistoryObj);
    }

    // Form the full details of the alert
    qualityAlertObj.alertID = alertId;
    qualityAlertObj.partsAffected = partsAffected;
    qualityAlertObj.events = events;
    qualityAlertObj.comments = comments;
    qualityAlertObj.history = alertHistories;
    qualityAlertObj.alertFlow = alertFlow;
    qualityAlertObj.relatedAlertID = relatedAlertID;
    qualityAlertObj.status = status;

    Logger.debug(`[${mspIDFromJWT}] getAlertDetails:  full alert Object = ${JSON.stringify(qualityAlertObj)}`);

    return qualityAlertObj;
  }

  /**
   *
   *
   * @param {*} filter
   * @param {string} mspIDFromJWT
   * @memberof QualityAlertMgmtClient
   */
  async getAllAlerts(filter: any, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] Called getAllAlerts`);
    let qualityAlertDetails: QualityAlertModel[] = [];
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
    const alertFilter = Object.assign({}, filter);
    Logger.debug(`[${mspIDFromJWT}]  getAllAlerts: eventFilter = ${JSON.stringify(filter)}`);

    let allAlerts = await connectionPool.alertModel.findAll({
      where: alertFilter,
    });
    Logger.debug(`[${mspIDFromJWT}]  getAllAlerts : allAlerts = ${JSON.stringify(allAlerts)}`);
    // Traverse through all the events and find details for each alerts and group it based on the parts details, comments and events
    for await (let alerts of allAlerts) {
      const qualityAlert = await this.getAlertDetails(alerts.alert_id, alerts.alert_flow, alerts.related_alert, alerts.status, mspIDFromJWT);
      qualityAlertDetails.push(qualityAlert);
    }
    Logger.debug(`[${mspIDFromJWT}]  getAllAlerts : allEvents = ${JSON.stringify(qualityAlertDetails)}`);
    return returnFunction(JSON.stringify(qualityAlertDetails), ResponseStatus.SUCCESS);
  }

  /**
   *
   *
   * @param {string} alertID
   * @param {*} alertDetails
   * @param {*} eventDetails
   * @param {string} mspIDFromJWT
   * @memberof QualityAlertMgmtClient
   */
  async processCommitForTopDown(alertID: string, alertDetails: any, eventDetails: any, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] Called processCommitForTopDown`);

    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);

    Logger.info(`[${mspIDFromJWT}] Updating the alert details as distributed`);
    await connectionPool.partQualityAlertModel.update(
      { propagated: true, status: QualityAlertStatus.DISTRIBUTED },
      {
        where: {
          // serial_number_customer: alert.serial_number_customer,
          alert_id: alertID,
        },
      },
    );

    Logger.info(`[${mspIDFromJWT}] Updating the event details as distributed`);
    await connectionPool.eventModel.update(
      { propagated: true, event_status: EventStatus.DISTRIBUTED },
      {
        where: {
          alert_id: alertID,
          event_target_company: eventDetails.event_target_company,
        },
      },
    );

    return;
  }

  /**
   *
   * This will consume alert history message from Kafka topic and save it in database
   *
   * @param {string} alertId
   * @param {string} eventOriginCompany
   * @param {string} eventTargetCompany
   * @param {*} eventType
   * @param {string} mspIDFromJWT
   * @return {*}
   * @memberof QualityAlertMgmtClient
   */
  async consumeAlertHistory(alertId: string, eventOriginCompany: string, eventTargetCompany: string, eventType: any, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] Called consumeAlertHistory function`);

    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);

    eventType = eventType.toUpperCase();
    let acceptedQualityAlertStatus = Object.values(AlertHistoryStatus);
    if (acceptedQualityAlertStatus.indexOf(eventType) == -1) {
      throw new Error("The status received is not allowed.");
    }

    Logger.debug(`[${mspIDFromJWT}] Status received: ${eventType}`);

    Logger.info(`[${mspIDFromJWT}] Saving the alertHistory details notification`);

    await connectionPool.alertHistoryModel.create({
      alert_id: alertId,
      alertHistoryOriginCompany: eventOriginCompany,
      alertHistoryTargetCompany: eventTargetCompany,
      alertHistoryType: eventType,
    });

    return;
  }

  /**
   *
   * Send a message to the given partner informing history of quality alert
   *
   * @param {string} alertId
   * @param {string} mspIDFromJWT
   * @param {string} alertHistoryType
   * @memberof QualityAlertMgmtClient
   */
  async sendAlertHistory(alertId: string, mspIDFromJWT: string, alertHistoryType: string) {
    const alertHistoryKafkaProducer = new AlertHistoryConsumer();
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
    //Fetch Event object
    const eventsParentResponse = await connectionPool.eventModel.findAll({ where: { alert_id: alertId } });
    Logger.info(`[${mspIDFromJWT}] AlertHistory: alertHistoryType: ${alertHistoryType}`);
    Logger.info(`[${mspIDFromJWT}] AlertHistory: Alert child generated fetched: ${JSON.stringify(eventsParentResponse)}`);
    const eventParentID = eventsParentResponse[0].event_relation;
    if (eventParentID.length != 0) {
      const eventsToBeCommitedResponse = await connectionPool.eventModel.findAll({ where: { event_uid: eventParentID } });
      Logger.info(`[${mspIDFromJWT}] AlertHistory: Source event fetched: ${JSON.stringify(eventsToBeCommitedResponse)}`);

      const alertHistoryObj: AlertHistoryModel = Object.create({});
      alertHistoryObj["alert_id"] = eventsToBeCommitedResponse[0].alert_id;
      alertHistoryObj["alertHistoryOriginCompany"] = eventsToBeCommitedResponse[0].event_target_company;
      alertHistoryObj["alertHistoryTargetCompany"] = eventsToBeCommitedResponse[0].event_origin_company;
      alertHistoryObj["alertHistoryType"] = alertHistoryType;

      const MSPID = await getMSPFromCustomerOneID(eventsToBeCommitedResponse[0].event_origin_company);
      // Send history to parent quality Alert
      alertHistoryKafkaProducer.send(JSON.stringify(alertHistoryObj), MSPID);
    }
  }
  /**
   *
   *
   * @param {string} alertID
   * @param {string} qualityType
   * @param {string} mspIDFromJWT
   * @return {*}
   * @memberof QualityAlertMgmtClient
   */
  async updateEventDetails(alertID: string, qualityType: string, mspIDFromJWT: string) {
    Logger.info(`[${mspIDFromJWT}] Called updateEventDetails`);
    Logger.info(`[${mspIDFromJWT}]  updateEventDetails: qualityType = ${qualityType} `);
    const offChainDBClient = new OffChainDBClient();
    const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);

    return {
      affectedTransactions: await connectionPool.eventModel.update({ event_type: qualityType }, { where: { alert_id: alertID, propagated: false } }),
    };
  }
}
