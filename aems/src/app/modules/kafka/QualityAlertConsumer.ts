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
 * Class that instantiates a kafka consumer to ingest assets to the Fabric system by picking up the assets from the
 * according kafka topics. The kafka topics are filled by the DIS. Stats about successful or failed ingests are sent back
 * to a kafka topic for further evaluation
 * @class
 */
export default class QualityAlertConsumer {
  private kafka: Kafka;
  private alertConsumer: any;
  private producer: any;
  private readonly logger: any;

  constructor() {
    this.logger = (log: any) => {
      return ({ namespace, level, label, log }: any) => {
        const { message, ...extra } = log;
        switch (level) {
          case logLevel.DEBUG:
            Logger.debug(`[KAFKA] QualityAlertConsumer: ${message}`);
            break;
          case logLevel.ERROR:
            Logger.error(`[KAFKA] QualityAlertConsumer: ${message}`);
            break;
          case logLevel.WARN:
            Logger.warn(`[KAFKA] QualityAlertConsumer: ${message}`);
            break;
          default:
            Logger.info(`[KAFKA] QualityAlertConsumer: ${message}`);
        }
      };
    };

    this.kafka = new Kafka({
      logLevel: logLevel.INFO,
      logCreator: this.logger,
      brokers: [`${defaults.kafka.alertHost}:${defaults.kafka.port}`],
      clientId: "AEMS-alert-client",
    });
  }

  /**
   * Consumer for alerts
   */
  async alertConsume() {
    Logger.info(`[KAFKA] QualityAlertConsumer Starting Consumer for topics`);
    const kafkaGroupID = defaults.kafka.alertGroupId;
    this.alertConsumer = this.kafka.consumer({ groupId: kafkaGroupID });
    await this.alertConsumer.connect();
    // Get all relevant mspIDs from identities and subscribe to their topics  assets.[realm name in lower case].topic
    const gatewaySingleton: GatewaySingleton = await GatewaySingleton.getInstance();
    const hlfIdentities = gatewaySingleton.getHLFIdentities();
    const admin = this.kafka.admin();
    // remember to connect and disconnect when you are done
    await admin.connect();
    const topics = await admin.listTopics();
    Logger.info(`[KAFKA] QualityAlertConsumer consume: Already existing topics: ${topics.toString()}`);

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
          // Logger.info(`[KAFKA] QualityAlertConsumer: Created topic ${mspID} since it did not exist yet`);
          Logger.error(`[KAFKA] QualityAlertConsumer consume: Topic ${mspID} does not exist!`);
        } else {
          const topic = `${mspID}-quality-alert`;
          Logger.info(`[KAFKA] QualityAlertConsumer consume : Subscribing to topic ${topic}`);
          //await this.alertConsumer.subscribe({ topic, fromBeginning: true }); // In case of replay from beginning
          await this.alertConsumer.subscribe({ topic });
          Logger.info(
            `[KAFKA] QualityAlertConsumer consume: Most recent offset for topic ${topic} ${JSON.stringify(await admin.fetchTopicOffsets(topic))}`,
          );
        }
      }
    }
    await admin.disconnect();

    Logger.info(`[KAFKA] QualityAlertConsumer: Group description: ${JSON.stringify(await this.alertConsumer.describeGroup())}`);

    this.alertConsumer.run({
      eachMessage: async ({ topic, partition, message }: any) => {
        Logger.info(`[KAFKA] QualityAlertConsumer: consume - topic = ${topic}  partition = ${partition}  message = ${message.value.toString()}`);
        const event = JSON.parse(message.value.toString());
        Logger.debug(`[KAFKA] QualityAlertConsumer: consume event = ${event} type = ${typeof event}  eventUID = ${event.eventUID}`);
        const client = new QualityAlertMgmtClient();
        try {
          const {
            eventUID,
            eventTimestamp,
            eventType,
            eventOriginApp,
            eventOriginCompany,
            eventTargetCompany,
            eventBody,
            eventFlow,
            comments,
            alertId,
            originPartnerName,
          } = event;

          Logger.info(`[KAFKA] QualityAlertConsumer: consume   eventUID = ${event.eventUID}`);
          const mspID = await getMSPFromCustomerOneID(eventTargetCompany);
          Logger.debug(`[KAFKA] QualityAlertConsumer: consume comments = ${comments} type = ${typeof comments} `);
          Logger.debug(`[KAFKA] QualityAlertConsumer:  consume  commentDetails = ${comments[0].message}`);
          await client.consumeQualityAlert(
            eventUID,
            alertId,
            eventTimestamp,
            eventOriginApp,
            eventOriginCompany,
            eventTargetCompany,
            eventType,
            eventBody,
            comments[0].message,
            eventFlow,
            mspID,
            originPartnerName,
          );
        } catch (e) {
          Logger.error(`[KAFKA] QualityAlertConsumer:  consume - Problem when consuming asset to failed  topic: ${JSON.stringify(e)}`);
        }
      },
    });

    //const errorTypes = ['unhandledRejection', 'uncaughtException'];
    const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];

    signalTraps.map(type => {
      // @ts-ignore
      process.once(type, async () => {
        try {
          Logger.info(`[KAFKA] QualityAlertConsumer: Disconnecting Consumer and Producer`);
          await this.alertConsumer.disconnect();
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
   * @memberof QualityAlertConsumer
   */
  async send(message: string, targetOrg: string) {
    Logger.debug(`[KAFKA] QualityAlertConsumer Starting producer  `);
    Logger.info(`[KAFKA]  QualityAlertConsumer: send message = ${message} targetOrg = ${targetOrg} `);

    this.producer = this.kafka.producer();
    await this.producer.connect();
    const topic = `${targetOrg}-quality-alert`;
    Logger.info(`[KAFKA]  QualityAlertConsumer: send topic = ${topic} `);
    this.producer
      .send({
        topic,
        messages: [{ value: message }],
      })
      .then(async (r: any) => {
        Logger.info(`[KAFKA]  QualityAlertConsumer: Send message successfully to : ${JSON.stringify(r)}`);
        await this.producer.disconnect();
      })
      .catch(async (e: { message: any }) => {
        await this.producer.disconnect();
        Logger.error(`[KAFKA] QualityAlertConsumer:  Problem when sending asset to failed  topic: ${JSON.stringify(e)}`);
      });
  }
}
