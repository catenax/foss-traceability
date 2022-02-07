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

import { map, pick, reduce, max, floor, random, toString, flatten, isEmpty, values } from 'lodash-es';
import { Investigation } from 'src/app/investigations/model/investigation.model';
import { QualityAlertTableBuilder } from '../builder/quality-alert-table.builder';
import { ReceivedQualityAlertTableBuilder } from '../builder/received-quality-alert-table.builder';
import { GroupedAlert } from '../model/grouped-alerts.model';
import { QualityAlertTypes } from '../model/quality-alert.model';

/**
 *
 *
 * @export
 * @class QualityAlertAssembler
 */
export class QualityAlertAssembler {
  /**
   * Quality alert assembler
   *
   * @static
   * @param {QualityAlert[]} qualityAlerts
   * @param {{ startDate: string; endDate: string }} lastLoginDate
   * @return {GroupedAlert[]}
   * @memberof QualityAlertAssembler
   */
  public static assembleQualityAlerts(
    qualityAlerts: Investigation[],
    lastLoginDate?: { startDate: string; endDate: string },
  ): GroupedAlert[] {
    const parts = flatten(qualityAlerts.map(alert => alert.partsAffected));
    parts.forEach(value => {
      value.actions = [{ role: 'write', icon: 'delete-bin-line', label: 'Delete serial number' }];
    });
    return reduce(
      qualityAlerts,
      (result: GroupedAlert[], qualityAlert: Investigation) => {
        const icon = {
          OK: 'checkbox-circle-line',
          MAJOR: 'alert-line',
          CRITICAL: 'spam-line',
          MINOR: 'error-warning-line',
          'LIFE-THREATENING': 'close-circle-line',
        };
        const colors = ['#6610f2', '#e83e8c', '#fe6702', '#20c997', '#03a9f4'];
        const randomColor: number = floor(random(colors.length));
        const alert: GroupedAlert = {
          alertId: qualityAlert.alertID,
          description: qualityAlert.comments[0]?.message,
          status: qualityAlert.status,
          qualityType: qualityAlert.partsAffected[0]?.qualityType,
          previousQualityType: qualityAlert.partsAffected[0]?.history?.qualityType,
          icon: icon[qualityAlert.partsAffected[0]?.qualityType],
          isActive: false,
          previousIcon: icon[qualityAlert.partsAffected[0]?.history?.qualityType],
          timestamp: max(qualityAlert.partsAffected?.map(affected => new Date(affected.updatedAt)))?.toISOString(),
          company:
            qualityAlert.events[0]?.originPartnerName || qualityAlert.events[0]?.eventOriginCompany
              ? qualityAlert.partsAffected[0]?.childCustomerOneid
                  .split('_')
                  .slice(2, 3)
                  .join()
              : '',
          type: this.getType(qualityAlert.status, qualityAlert.relatedAlertID),
          control:
            qualityAlert.status === QualityAlertTypes.PENDING || qualityAlert.status === QualityAlertTypes.CREATED
              ? 'write'
              : 'read',
          originCompany: qualityAlert.events[0]?.originPartnerName || qualityAlert.events[0]?.eventOriginCompany,
          avatar: {
            name: qualityAlert.events[0]?.originPartnerName || qualityAlert.events[0]?.eventOriginCompany,
            color: toString(colors[randomColor]),
          },
          relatedId: qualityAlert.relatedAlertID,
          table: isEmpty(qualityAlert.relatedAlertID)
            ? QualityAlertTableBuilder.getTable()
            : ReceivedQualityAlertTableBuilder.getTable(),
          children: map(qualityAlert.partsAffected, partsAffected =>
            pick(
              partsAffected,
              'partNameManufacturer',
              'partNumberManufacturer',
              'serialNumberCustomer',
              'childSerialNumberCustomer',
              'childPartNameManufacturer',
              'childPartNumberManufacturer',
              'childCustomerOneid',
              'alertId',
              'type',
              'actions',
              'status',
            ),
          ),
          numberOfParts: qualityAlert.partsAffected?.length,
        };

        const extendedAlert: GroupedAlert = {
          ...alert,
          numberOfParts: alert.children.filter(external => external.status !== 'canceled').length,
          isRecent:
            values(lastLoginDate).every(date => date === '') ||
            (new Date(alert.timestamp).getTime() >= new Date(+lastLoginDate.startDate * 1000).getTime() &&
              new Date(alert.timestamp).getTime() <= new Date(+lastLoginDate.endDate * 1000).getTime()),
        };

        return [...result, { ...extendedAlert }].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
      },
      [],
    );
  }

  /**
   * Quality alert type getter
   *
   * @private
   * @static
   * @param {string} type
   * @param {string} relatedId
   * @return {string}
   * @memberof QualityAlertAssembler
   */
  private static getType(type: string, relatedId: string): string {
    return type === QualityAlertTypes.PENDING || (type === QualityAlertTypes.DISTRIBUTED && isEmpty(relatedId))
      ? 'Queued'
      : 'Received';
  }
}
