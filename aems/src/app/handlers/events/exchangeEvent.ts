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

import Logger from "../../modules/logger/Logger";
import SmartContractClient from "../../domains/SmartContractClient";
//import QualityAlertMgmtClient from "../../domains/QualityAlertMgmtClient";
import { RelationshipStatusType } from "../../enums/RelationshipStatusType";
import OffChainDBClient from "../../domains/OffChainDBClient";
import GatewaySingleton from "../../modules/gateway/GatewaySingleton";

import { Event } from "../../interfaces/Events";
import QualityAlert, { QualityModel } from "../../interfaces/QualityAlert";
import { QualityAlertStatus, EventStatus } from "../../enums/QualityStatus";
import { getCustomerOneIDFromMSP, getWeightageByQualityType } from "../../modules/helper-functions/Helper";
import { AssetList, Asset } from "../../modules/asset-validator/AssetValidator";
/**
 * Exchange asset event handlers of smartcontract
 * @param exchangeEventDetails
 *
 * 1. Fetch the shared child component details
 * 2. Compute the full hash and verify with the data available in the public state
 * 3. Write to OffChainDB
 */

export default async function exchangeAssetEvent(exchangeEventDetails: string) {
  try {
    const client = new SmartContractClient();
    const exchangeEvent = JSON.parse(exchangeEventDetails);
    const ParentSerialNumberCustomer = exchangeEvent.key;
    const mspID = exchangeEvent.mspID;
    const gatewaySingleton: GatewaySingleton = await GatewaySingleton.getInstance();
    const hlfIdentities = gatewaySingleton.getHLFIdentities();

    Logger.info(` exchangeAssetEvent: ParentSerialNumberCustomer ${ParentSerialNumberCustomer}, Target MSP ${mspID})`);
    for (let identity of Object.keys(hlfIdentities)) {
      let mspIDs: Array<string> = [hlfIdentities[identity]["HLF_IDENTITY_MSP_ID"]];
      // Check for TAAS subscribers
      if (hlfIdentities[identity].hasOwnProperty("HLF_MANAGED_IDENTITY_MSP_ID")) {
        // In case we have taas managed identities we get them from HLF_MANAGED_IDENTITY_MSP_ID
        //TODO: Assumming that the TAAS org itself doesnot take part in store asset and data exchange
        mspIDs = [...hlfIdentities[identity]["HLF_MANAGED_IDENTITY_MSP_ID"]];
      }
      for (let mspIDFromJWT of mspIDs) {
        if (mspIDFromJWT === mspID) {
          // Retrieving the shared child component  Information
          let exchangedAssetEventDetails = await client.getAssetEventDetail(ParentSerialNumberCustomer, mspIDFromJWT);
          Logger.info(`[${mspIDFromJWT}] exchangeAssetEvent:  Asset Event details ${JSON.stringify(exchangedAssetEventDetails)}`);

          if (exchangedAssetEventDetails.status === 404) {
            //TODO Handle this properly. At the moment we skip the event in case of 404. If we implement
            // the event replay functionality this needs to revisited and we can replay the missed event!
            // In the normal exchange case this does not matter, but in case of updateAsset we would loose the update!
            Logger.warn(`[${mspIDFromJWT}] exchangeAssetEvent:  We could not find ${ParentSerialNumberCustomer} in our PDC! Skipping the event.`);
          } else {
            const exchangedAsset = exchangedAssetEventDetails.data;

            if (exchangedAsset.hasOwnProperty("serialNumberManufacturer")) {
              Logger.info(`[${mspIDFromJWT}] exchangeAssetEvent: Asset details = ${JSON.stringify(exchangedAsset)}`);
              Logger.info(`[${mspIDFromJWT}] exchangeAssetEvent: Validating the component information `);
              // Validating Child component shared by the requested Org
              const validate_response = await client.validateAsset(exchangedAsset, mspIDFromJWT);

              Logger.info(`[${mspIDFromJWT}] exchangeAssetEvent: Child Component validation details = ${JSON.stringify(validate_response)}`);
              if (validate_response.data.result) {
                Logger.info(
                  `[${mspIDFromJWT}] exchangeAssetEvent: Child component verification is successful now storing the data in the offchainDB`,
                );
                // Store Asset to Off-chain DB
                // If this fails, the asset stays in status 2 and is retried again soon
                const offChainDBClient = new OffChainDBClient();
                offChainDBClient.upsertAsset(exchangedAsset, mspIDFromJWT, exchangedAsset.mspID).then(() => {
                  const offChainDBClient = new OffChainDBClient();
                  // The exchanged asset can either be in a parent relationship or in a child relationship.
                  // If the exchanged asset is a parent we can update the relationship,
                  // else if the exchanged asset is a child then the exchangeAsset was called as part of the updateAsset process,
                  // therefore we do not have anything to update
                  offChainDBClient
                    .updateRelationshipStatus(mspIDFromJWT, exchangedAsset.serialNumberCustomer, RelationshipStatusType.childShared)
                    .then(async () => {
                      // check if there is an alertID in the custom field
                      // if there is alertID then   find the parent and create an alert with same alertID and insert parent in the alertTable
                      // add logic to reverse the quality status [ QualityStatus = true => OK,QualityStatus = false => NOK ]
                      if (exchangedAsset.customFields.hasOwnProperty("alertID")) {
                        Logger.info(`[${mspIDFromJWT}] exchangeAssetEvent: quality Alert received = ${exchangedAsset.customFields.alertID}`);
                        const alertID = exchangedAsset.customFields.alertID;
                        const qualityType = exchangedAsset.customFields.qualityType;
                        const qualityAlert = exchangedAsset.customFields.qualityAlert;

                        Logger.info(
                          `[${mspIDFromJWT}] exchangeAssetEvent: quality Alert received  alertID = ${alertID}  qualityType = ${qualityType}  qualityAlert = ${qualityAlert}`,
                        );
                        // Add child serialNumberCustomer also to the alert table
                        const parentAssetList: AssetList = [];
                        // Identify the parents of the asset
                        await offChainDBClient.getAssetParent(exchangedAsset.serialNumberCustomer, mspIDFromJWT).then((r: any) => {
                          r.parents.forEach(async (parent: any) => {
                            if (parent.mspid === mspIDFromJWT) {
                              Logger.info(`[${mspIDFromJWT}] exchangeAssetEvent: Parent data = ${JSON.stringify(parent)} `);
                              Logger.info(`[${mspIDFromJWT}] exchangeAssetEvent: Parent affected = ${parent.serialNumberCustomer} `);
                              parentAssetList.push(parent);
                            }
                          });
                        });
                        Logger.info(`[${mspIDFromJWT}] exchangeAssetEvent: parentAssetList to create alert = ${JSON.stringify(parentAssetList)} `);
                      } else if (exchangedAsset.qualityStatus === "NOK") {
                        //If Asset is NOK, look for a parent which we also have to flag as NOK
                        offChainDBClient.getAssetParent(exchangedAsset.serialNumberCustomer, mspIDFromJWT).then((r: any) => {
                          r.parents.forEach(async (parent: any) => {
                            if (parent.mspid === mspIDFromJWT) {
                              Logger.info(
                                `[${mspIDFromJWT}] Asset ${exchangedAsset.serialNumberCustomer} was changed to NOK, also changing its parent to NOK now!`,
                              );
                              const parentNOK = parent;
                              parentNOK.qualityStatus = "NOK";
                              client
                                .updateAsset(parentNOK, mspIDFromJWT, true)
                                .then(r => Logger.info(`[${mspIDFromJWT}] Successfully updated parent ${JSON.stringify(parentNOK)} to NOK`));
                            }
                          });
                        });
                      }
                    });
                });
              } else {
                Logger.warn(
                  `[${mspIDFromJWT}] Child component details are not fully shared, storing Child anyway with status ${RelationshipStatusType.childHashValidationFailure}`,
                );
                const offChainDBClient = new OffChainDBClient();
                offChainDBClient.upsertAsset(exchangedAsset, mspIDFromJWT, exchangedAsset.mspID).then(() => {
                  const offChainDBClient = new OffChainDBClient();
                  offChainDBClient.updateRelationshipStatus(
                    mspIDFromJWT,
                    exchangedAsset.serialNumberCustomer,
                    RelationshipStatusType.childHashValidationFailure,
                  );
                });
              }
            }
          }
        } else {
          Logger.info(`[${mspIDFromJWT}] Rejecting the exchange event request since its addressed to org ${mspID}`);
        }
      }
    }
  } catch (error) {
    Logger.error(`Error occurred in exchangeAssetEvent ${error}`);
  }
}

/**
 *
 *
 * @param {string} alertID
 * @param {string} childSerialNumberCustomer
 * @param {string[]} parentAssetList
 * @param {string} qualityType
 * @param {boolean} qualityAlert
 * @param {string} mspIDFromJWT
 */
const processQualityAlert = async (
  alertID: string,
  childSerialNumberCustomer: string,
  parentAssetList: Asset[],
  qualityType: string,
  qualityAlert: boolean,
  mspIDFromJWT: string,
  eventType: string,
  childPartNameManufacturer: string,
  childPartNumberManufacturer: string,
  childCustomerOneID: string,
) => {
  Logger.info(`[${mspIDFromJWT}] processQualityAlert:`);

  const alerts: Array<QualityAlert> = [];
  const targetCompanies: Set<string> = new Set();
  const events: Array<Event> = [];
  const offChainDBClient = new OffChainDBClient();
  const connectionPool = await offChainDBClient.connectAndSync(mspIDFromJWT);
  const eventOriginCompany = await getCustomerOneIDFromMSP(mspIDFromJWT);
  Logger.info(`[${mspIDFromJWT}] processQualityAlert: parentAssetList = ${JSON.stringify(parentAssetList)} `);

  for await (let asset of parentAssetList) {
    //TODO: Check if the parent already belongs to an quality alert.
    //: Check the current quality status of the parent asset and compare if the received quality alerts has higher precedence  [CRITICAL> MAJOR> MINOR ]
    //1. Get current details of the parent asset in the pending state
    //2. Check if the new incoming quality alert got higher precedence
    //3. If new quality alert has higher precedence, mark the old quality alert as deleted and create the quality alert for the parent asset with status pending

    //get the list of all TargetCompany from the company One IDs

    const alertFilter = {
      serial_number_customer: asset.serialNumberCustomer,
      status: QualityAlertStatus.PENDING,
    };
    let parentAssetCheck = await connectionPool.partQualityAlertModel.findAll({
      where: alertFilter,
    });

    Logger.info(`[${mspIDFromJWT}] processQualityAlert: parentAssetCheck = ${JSON.stringify(parentAssetCheck)} `);
    Logger.info(`[${mspIDFromJWT}] processQualityAlert: parentAssetCheck.length = ${JSON.stringify(parentAssetCheck.length)} `);
    if (parentAssetCheck.length == 0) {
      const currentQualityStatus: QualityModel = {
        qualityType: asset.customFields.hasOwnProperty("qualitytype") ? (asset.customFields.qualityType as string) : "OK",
        qualityAlert: asset.customFields.qualityalert as boolean,
      };
      const qualityAlertObj: QualityAlert = Object.create({});
      qualityAlertObj["alert_id"] = alertID;
      qualityAlertObj["serial_number_customer"] = asset.serialNumberCustomer;
      qualityAlertObj["child_serial_number_customer"] = childSerialNumberCustomer;
      qualityAlertObj["quality_type"] = qualityType;
      qualityAlertObj["quality_alert"] = qualityAlert;
      qualityAlertObj["propagated"] = false;
      qualityAlertObj["mspid"] = mspIDFromJWT;
      qualityAlertObj["status"] = QualityAlertStatus.PENDING;
      qualityAlertObj["app_name"] = "PartChain";
      qualityAlertObj["customer_oneid"] = asset.customFields.customeroneid as string;
      qualityAlertObj["history"] = currentQualityStatus;
      qualityAlertObj["part_name_manufacturer"] = asset.partNameManufacturer;
      qualityAlertObj["part_number_manufacturer"] = asset.partNumberManufacturer;
      qualityAlertObj["child_part_name_manufacturer"] = childPartNameManufacturer;
      qualityAlertObj["child_part_number_manufacturer"] = childPartNumberManufacturer;
      qualityAlertObj["child_customer_oneid"] = childCustomerOneID;
      alerts.push(qualityAlertObj);
      targetCompanies.add(asset.customFields.customeroneid as string);
    } else {
      //TODO: Make this clean with adding common function to consume alert as well.
      const currentQualityAlertWeightage = await getWeightageByQualityType(parentAssetCheck[0].quality_type);
      const newQualityAlertWeightage = await getWeightageByQualityType(qualityType);

      Logger.info(`[${mspIDFromJWT}] processQualityAlert: currentQualityAlertWeightage = ${JSON.stringify(currentQualityAlertWeightage)} `);
      Logger.info(`[${mspIDFromJWT}] processQualityAlert: newQualityAlertWeightage = ${JSON.stringify(newQualityAlertWeightage)} `);
      if (newQualityAlertWeightage > currentQualityAlertWeightage) {
        Logger.info(
          `[${mspIDFromJWT}] processQualityAlert: The weightage of new quality_alert is greater, So updating the parent asset alertID and qualityStatus to the latest`,
        );

        await connectionPool.partQualityAlertModel.update(
          { quality_type: qualityType, alert_id: alertID, child_serial_number_customer: childSerialNumberCustomer },
          { where: { serial_number_customer: asset.serialNumberCustomer, status: QualityAlertStatus.PENDING } },
        );
      }
    }
  }

  Logger.info(`[${mspIDFromJWT}] processQualityAlert: alerts Array = ${JSON.stringify(alerts)} `);

  // Creating the event for each targetOrgs

  for await (let targetCompany of targetCompanies) {
    const eventObj: Event = Object.create({});
    // Check if the event already exist
    const eventFilter = {
      event_uid: alertID,
      event_origin_company: eventOriginCompany,
      event_target_company: targetCompany,
    };
    let eventData = await connectionPool.eventModel.findAll({
      where: eventFilter,
    });
    // Create event only if it doesnot exist
    if (eventData.length == 0) {
      eventObj["event_uid"] = alertID;
      eventObj["event_origin"] = "PartChain";
      eventObj["event_origin_company"] = eventOriginCompany;
      eventObj["event_target_company"] = targetCompany;
      eventObj["event_type"] = eventType;
      eventObj["event_status"] = EventStatus.PENDING;
      eventObj["propagated"] = false;
      events.push(eventObj);
    }
  }

  Logger.info(`[${mspIDFromJWT}] processQualityAlert: events Array = ${JSON.stringify(events)} `);
  if (alerts.length > 0) {
    //Insert data to the alert Table
    const result = await connectionPool.partQualityAlertModel.bulkCreate(alerts);
    Logger.info(`[${mspIDFromJWT}] processQualityAlert: result of alerts = ${JSON.stringify(result)}`);
  }

  if (events.length > 0) {
    //Insert data to the event Table
    const result = await connectionPool.eventModel.bulkCreate(events);
    Logger.info(`[${mspIDFromJWT}] processQualityAlert: result of events = ${JSON.stringify(result)}`);
  }
};
