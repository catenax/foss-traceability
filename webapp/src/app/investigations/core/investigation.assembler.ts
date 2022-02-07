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

import { reduce, max, random, floor, toString } from 'lodash-es';
import { Investigation } from '../model/investigation.model';
import { QualityInvestigation } from '../model/quality-investigation.model';

/**
 *
 *
 * @export
 * @class InvestigationAssembler
 */
export class InvestigationAssembler {
  /**
   * Quality investigation view assembler
   *
   * @static
   * @param {Investigation[]} investigations
   * @return {QualityInvestigation[]}
   * @memberof InvestigationAssembler
   */
  public static assembleQualityInvestigations(investigations: Investigation[]): QualityInvestigation[] {
    return reduce(
      investigations,
      (result: QualityInvestigation[], investigation: Investigation) => {
        const colors = ['#6610f2', '#e83e8c', '#fe6702', '#20c997', '#03a9f4'];
        const randomColor: number = floor(random(colors.length));
        const qualityInvestigations: QualityInvestigation = {
          alertId: investigation.alertID,
          status: investigation.status,
          affectedSerialNumbers: investigation.partsAffected.map(parts => parts.serialNumberCustomer),
          numberOfParts: investigation.partsAffected.length,
          originCompany: investigation.events[0].originPartnerName || investigation.events[0].eventOriginCompany,
          targetCompany: investigation.events[0].eventTargetCompany,
          description: investigation.comments[0].message,
          isActive: false,
          timestamp: max(investigation.partsAffected.map(affected => new Date(affected.updatedAt))).toISOString(),
          avatar: {
            name: investigation.events[0].originPartnerName || investigation.events[0].eventOriginCompany,
            color: toString(colors[randomColor]),
          },
        };
        result = [...result, { ...qualityInvestigations }];
        return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },
      [],
    );
  }
}
