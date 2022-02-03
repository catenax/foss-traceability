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

import { Kafka, logLevel } from "kafkajs";
import Logger from "../logger/Logger";
import defaults from "../../defaults";
import GatewaySingleton from "../gateway/GatewaySingleton";
import QualityAlertMgmtClient from "../../domains/QualityAlertMgmtClient";
import { getMSPFromCustomerOneID } from "../helper-functions/Helper";

/**
 * Class that instantiates a kafka consumer to receive and send message histories
 * @class
 */
export default class AlertHistoryConsumer {
  private kafka: Kafka;
  private alertHistoryConsumer: any;
  private producer: any;
  private readonly logger: any;

  constructor() {
    this.logger = (log: any) => {
      return ({ namespace, level, label, log }: any) => {
        const { message, ...extra } = log;
        switch (level) {
          case logLevel.DEBUG:
            Logger.debug(`[KAFKA] AlertHistoryConsumer: ${message}`);
            break;
          case logLevel.ERROR:
            Logger.error(`[KAFKA] AlertHistoryConsumer: ${message}`);
            break;
          case logLevel.WARN:
            Logger.warn(`[KAFKA] AlertHistoryConsumer: ${message}`);
            break;
          default:
            Logger.info(`[KAFKA] AlertHistoryConsumer: ${message}`);
        }
      };
    };

    this.kafka = new Kafka({
      logLevel: logLevel.INFO,
      logCreator: this.logger,
      brokers: [`${defaults.kafka.alertHost}:${defaults.kafka.port}`],
      clientId: "AEMS-alert-history-client",
    });
  }

  /**
   * Consumer for alerts history
   */
  async alertHistoryConsume() {
    Logger.info(`[KAFKA] AlertHistoryConsumer Starting Consumer for topics`);
    const kafkaGroupID = defaults.kafka.alertHistoryGroupId;
    this.alertHistoryConsumer = this.kafka.consumer({ groupId: kafkaGroupID });
    await this.alertHistoryConsumer.connect();
    // Get all relevant mspIDs from identities and subscribe to their topics  assets.[realm name in lower case].topic
    const gatewaySingleton: GatewaySingleton = await GatewaySingleton.getInstance();
    const hlfIdentities = gatewaySingleton.getHLFIdentities();
    const admin = this.kafka.admin();
    // remember to connect and disconnect when you are done
    await admin.connect();
    const topics = await admin.listTopics();
    Logger.info(`[KAFKA] AlertHistoryConsumer consume: Already existing topics: ${topics.toString()}`);

    for (let identity of Object.keys(hlfIdentities)) {
      let mspIDs: Array<string> = [hlfIdentities[identity]["HLF_IDENTITY_MSP_ID"]];
      if (hlfIdentities[identity].hasOwnProperty("HLF_MANAGED_IDENTITY_MSP_ID")) {
        // In case we have taas managed identities we get them from HLF_MANAGED_IDENTITY_MSP_ID
        //TODO: Assumming that the TAAS org itself doesnot take part in store asset and data exchange
        mspIDs = [...hlfIdentities[identity]["HLF_MANAGED_IDENTITY_MSP_ID"]];
      }
      for (let mspID of mspIDs) {
        if (!topics.includes(mspID)) {
          // await admin.createTopics({ topics: [{topic: mspID}] }) // We don`t to create topics in aems
          // Logger.info(`[KAFKA] AlertHistoryConsumer: Created topic ${mspID} since it did not exist yet`);
          Logger.error(`[KAFKA] AlertHistoryConsumer consume: Topic ${mspID} does not exist!`);
        } else {
          const topic = `${mspID}-ALERT-HISTORY`;
          Logger.info(`[KAFKA] AlertHistoryConsumer consume : Subscribing to topic ${topic}`);
          //await this.alertHistoryConsumer.subscribe({ topic, fromBeginning: true }); // In case of replay from beginning
          await this.alertHistoryConsumer.subscribe({ topic });
          Logger.info(
            `[KAFKA] AlertHistoryConsumer consume: Most recent offset for topic ${topic} ${JSON.stringify(await admin.fetchTopicOffsets(topic))}`,
          );
        }
      }
    }
    await admin.disconnect();

    Logger.info(`[KAFKA] AlertHistoryConsumer: Group description: ${JSON.stringify(await this.alertHistoryConsumer.describeGroup())}`);

    this.alertHistoryConsumer.run({
      eachMessage: async ({ topic, partition, message }: any) => {
        Logger.debug(`[KAFKA] AlertHistoryConsumer: consume - topic = ${topic}  partition = ${partition}  message = ${message.value.toString()}`);
        const alertHistory = JSON.parse(message.value.toString());
        Logger.debug(
          `[KAFKA] AlertHistoryConsumer: consume alertHistory = ${alertHistory} type = ${typeof alertHistory}  alertId = ${alertHistory.alertId}`,
        );
        const client = new QualityAlertMgmtClient();
        try {
          const { alertHistoryType, alertHistoryOriginCompany, alertHistoryTargetCompany, alert_id } = alertHistory;

          Logger.info(`[KAFKA] AlertHistoryConsumer: consume alertId = ${alertHistory.alert_id}`);
          const mspID = await getMSPFromCustomerOneID(alertHistoryTargetCompany);

          await client.consumeAlertHistory(alert_id, alertHistoryOriginCompany, alertHistoryTargetCompany, alertHistoryType, mspID);
        } catch (e) {
          Logger.error(`[KAFKA] AlertHistoryConsumer:  consume - Problem when consuming asset to failed  topic: ${JSON.stringify(e)}`);
        }
      },
    });

    //const errorTypes = ['unhandledRejection', 'uncaughtException'];
    const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];

    signalTraps.map(type => {
      // @ts-ignore
      process.once(type, async () => {
        try {
          Logger.info(`[KAFKA] AlertHistoryConsumer: Disconnecting Consumer and Producer`);
          await this.alertHistoryConsumer.disconnect();
          await this.producer.disconnect();
        } finally {
          process.kill(process.pid, type);
        }
      });
    });
  }

  /**
   *
   *
   * @param {string} message
   * @param {string} targetOrg
   * @memberof AlertHistoryConsumer
   */
  async send(message: string, targetOrg: string) {
    Logger.debug(`[KAFKA] AlertHistoryProducer Starting producer  `);
    Logger.info(`[KAFKA]  AlertHistoryProducer: send message = ${message} targetOrg = ${targetOrg} `);

    this.producer = this.kafka.producer();
    await this.producer.connect();
    const topic = `${targetOrg}-ALERT-HISTORY`;
    Logger.info(`[KAFKA]  AlertHistoryProducer: send topic = ${topic} `);
    this.producer
      .send({
        topic,
        messages: [{ value: message }],
      })
      .then(async (r: any) => {
        Logger.info(`[KAFKA]  AlertHistoryProducer: Send message successfully to : ${JSON.stringify(r)}`);
        await this.producer.disconnect();
      })
      .catch(async (e: { message: any }) => {
        await this.producer.disconnect();
        Logger.error(`[KAFKA] AlertHistoryProducer:  Problem when sending asset to failed  topic: ${JSON.stringify(e)}`);
      });
  }
}
