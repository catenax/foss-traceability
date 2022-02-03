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

import Logger from "../logger/Logger";
const aws = require("@aws-sdk/client-ses");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
/**
 * generateID
 * @param length
 */
export const generateID = async (length: number) => {
  Logger.debug(`generateID:start`);
  let result = crypto.randomBytes(length).toString("hex");
  Logger.debug(`generateID:end`);
  return result;
};

/**
 * Return function
 * @async
 * @param string
 * @param status
 */
export const returnFunction = async (payload: string, status: number) => {
  Logger.info(`Payload in the return function response =${payload}, status = ${status}`);
  return {
    data: payload,
    status: status,
  };
};
/**
 *
 *
 * @param {string} mspid
 */
//TODO: Remove  the mapping after POC
export const getCustomerOneIDFromMSP = async (mspid: string) => {
  Logger.info(`getting CustomerOneID For MSP =${mspid}`);

  switch (mspid) {
    case "BMW":
      return "CAXSWPFTJQEVZNZZ";
    case "TAAS-BILSTEIN":
      return "Partner_00002_BILSTEIN";
    case "TAAS-GRIS":
      return "CAXSJRTGOPVESVZZ";
    case "TAAS-ZF":
      return "CAXLTHAJNAHZXGZZ";
    case "TAAS-TIER1":
      return "Partner_00005_TIER1";
    case "TAAS-HENKEL":
      return "CAXLHNJURNRLPCZZ";
    case "TAAS-BASF":
      return "CAXLBRHHQAJAIOZZ";
    default:
      return "NotFound";
  }
};
/**
 *
 *
 * @param {string} customerOneID
 * @return {*}
 */
//TODO: Remove  the mapping after POC
export const getMSPFromCustomerOneID = async (customerOneID: string) => {
  Logger.info(`getting MSP Form CustomerOneID =${customerOneID}`);

  switch (customerOneID) {
    case "CAXSWPFTJQEVZNZZ":
      return "BMW";
    case "Partner_00002_BILSTEIN":
      return "TAAS-BILSTEIN";
    case "CAXSJRTGOPVESVZZ":
      return "TAAS-GRIS";
    case "CAXLTHAJNAHZXGZZ":
      return "TAAS-ZF";
    case "Partner_00005_TIER1":
      return "TAAS-TIER1";
    case "CAXLHNJURNRLPCZZ":
      return "TAAS-HENKEL";
    case "CAXLBRHHQAJAIOZZ":
      return "TAAS-BASF";
    default:
      return "NotFound";
  }
};
/**
 *
 *
 * @param {string} qualityType
 * @return {*}
 */
export const getWeightageByQualityType = async (qualityType: string) => {
  Logger.info(`getWeightageByQualityType = ${qualityType}`);

  switch (qualityType.toLocaleUpperCase()) {
    case "MINOR":
      return 1;
    case "MAJOR":
      return 2;
    case "CRITICAL":
      return 3;
    default:
      return 0;
  }
};
/**
 *
 *
 * @param {string} companyName
 * @return {*}
 */
export const getContactInfo = async (companyName: string) => {
  Logger.info(`getEmail = ${companyName}`);

  switch (companyName) {
    case "CAXSJRTGOPVESVZZ":
      return {
        name: "Markus Kreuz",
        email: "kreuz@fev.com",
        url: "https://ui.zf-sbr.test.catenax.partchain.dev/taas-gris/quality-alert",
      };
    case "CAXLTHAJNAHZXGZZ":
      return {
        name: "Markus Kreuz",
        email: "kreuz@fev.com",
        url: "https://ui.zf.test.catenax.partchain.dev/taas-zf/quality-alert",
      };
    case "CAXSWPFTJQEVZNZZ":
      return {
        name: "Markus Kreuz",
        email: "kreuz@fev.com",
        url: "https://ui.bmw.test.catenax.partchain.dev/bmw/quality-alert",
      };
    case "CAXLHNJURNRLPCZZ":
      return {
        name: "Markus Kreuz",
        email: "kreuz@fev.com",
        url: "https://ui.henkel.test.catenax.partchain.dev/taas-henkel/quality-alert",
      };
    case "CAXLBRHHQAJAIOZZ":
      return {
        name: "Markus Kreuz",
        email: "kreuz@fev.com",
        url: "https://ui.basf.test.catenax.partchain.dev/taas-basf/quality-alert",
      };

    default:
      return null;
  }
};

/**
 *
 *
 * @param {string[]} input
 * @return {*}
 */
export const getMinAndMaxDate = async (input: string[]) => {
  Logger.info("getMinAndMaxDate");
  let dates = input.map(function (date) {
    return new Date(date);
  });
  const maxDate = new Date(Math.max.apply(null, dates));
  const minDate = new Date(Math.min.apply(null, dates));
  return { maxDate, minDate };
};

/**
 *
 *
 * @param {string} to
 * @param {string} subject
 * @param {string} htmlBody
 */
export const sendEmail = async (to: string, subject: string, htmlBody: string) => {
  Logger.info("sendEmail: Start ");
  const ses = new aws.SES({
    apiVersion: "2010-12-01",
    region: "eu-west-1",
  });
  let transporter = nodemailer.createTransport({
    SES: { ses, aws },
  });

  let mailOptions = {
    from: "quality.alert@partchain.dev",
    to: to,
    subject: subject,
    html: htmlBody,
  };

  transporter.sendMail(mailOptions, function (error: any, info: any) {
    if (error) {
      Logger.error(`sendEmail: error ${JSON.stringify(error)}`);
    } else {
      Logger.info("sendEmail: Email sent: " + info.response);
    }
  });
};
