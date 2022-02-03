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

import { QualityAlertType, QualityAlertStatus } from "../enums/QualityStatus";
import Logger from "../modules/logger/Logger";
import defaults from "../defaults";
import QualityAlertMgmtClient from "../domains/QualityAlertMgmtClient";
import GatewaySingleton from "../modules/gateway/GatewaySingleton";
import _ = require("lodash");
const cron = require("node-cron");

export default async function qualityAlertScheduler() {
  const qualityClient = new QualityAlertMgmtClient();
  const gatewaySingleton: GatewaySingleton = await GatewaySingleton.getInstance();
  const hlfIdentities = gatewaySingleton.getHLFIdentities();

  // Scheduler to look up for the life-threatening alerts
  // Currently, it will run every 3 minutes and check if there are any life-threatening alerts in pending status in the last 3 minutes.
  //
  cron.schedule(defaults.cronjob.status.qualityAlert.schedule, async () => {
    Logger.info(`qualityAlertScheduler: Time to process quality alert with status ${QualityAlertType.LIFE_THREATENING} alert`);
    Logger.info(`qualityAlertScheduler: Get all the quality alert with Life threatening status`);
    for (let identity of Object.keys(hlfIdentities)) {
      let mspIDs: Array<string> = [hlfIdentities[identity]["HLF_IDENTITY_MSP_ID"]];
      if (hlfIdentities[identity].hasOwnProperty("HLF_MANAGED_IDENTITY_MSP_ID")) {
        // In case we have taas managed identities we get them from HLF_MANAGED_IDENTITY_MSP_ID
        //TODO: Assumming that the TAAS org itself doesnot take part in store asset and data exchange
        mspIDs = [...hlfIdentities[identity]["HLF_MANAGED_IDENTITY_MSP_ID"]];
      }
      for (let mspID of mspIDs) {
        const eventDetails = await qualityClient.getEventWithQualityTypeAndStatus(
          QualityAlertType.LIFE_THREATENING,
          QualityAlertStatus.PENDING,
          mspID,
        );
        Logger.info(`[${mspID}] qualityAlertScheduler:  eventDetails = ${JSON.stringify(eventDetails)}`);
        // Find all the events which are created in last 3 minutes
        let eventsToProcess: string[] = [];
        const currentTime = new Date();
        for await (let event of eventDetails) {
          Logger.info(`[${mspID}] qualityAlertScheduler: Processing ${event}`);
          const eventCreateTime = new Date(event.createdAt);
          let diffMs = +currentTime - +eventCreateTime; // milliseconds between now & create time of event
          let diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
          // Push the eventIDs to an array which of which the createAt is greater than 3 mins from the current time
          Logger.info(`[${mspID}] qualityAlertScheduler: Current time interval = ${defaults.cronjob.status.qualityAlert.timeInterval}`);
          if (diffMins >= defaults.cronjob.status.qualityAlert.timeInterval) {
            eventsToProcess.push(event.alert_id);
          }
        }
        // Commit the quality alert
        Logger.info(`[${mspID}] qualityAlertScheduler: List of quality alerts to commit = ${JSON.stringify(eventsToProcess)}`);
        if (eventsToProcess.length > 0) {
          const commitResponse = await qualityClient.commitQualityAlert(eventsToProcess, mspID);
          Logger.info(`[${mspID}] qualityAlertScheduler: commitResponse = ${JSON.stringify(commitResponse)}`);
        } else {
          Logger.info(`[${mspID}] qualityAlertScheduler: no life-threating quality alerts to process`);
        }
      }
    }
  });
}
