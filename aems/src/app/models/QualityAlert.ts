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
 *
 *
 * @export
 * @param {*} sequelize
 * @param {*} DataTypes
 * @return {*}
 */
export default function qualityAlertModel(sequelize: any, DataTypes: any) {
  return sequelize.define("qualityalert", getQualityAlertModelDefinition(DataTypes), getQualityAlertModelIndices());
}

export function getQualityAlertModelDefinition(DataTypes: any) {
  return {
    alert_id: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    status: {
      type: DataTypes.TEXT,
    },
    alert_flow: {
      type: DataTypes.TEXT,
    },
    related_alert: {
      type: DataTypes.TEXT,
    },
  };
}

export function getQualityAlertModelIndices() {
  return {
    tableName: "qualityalert",
    timestamps: true,
    indexes: [
      {
        name: "quality_alert_index",
        unique: false,
        fields: ["alert_id"],
      },
      {
        name: "quality_alert_status_index",
        unique: false,
        fields: ["status"],
      },
      {
        name: "quality_alert_flow_index",
        unique: false,
        fields: ["alert_flow"],
      },
      {
        name: "quality_related_alert_index",
        unique: false,
        fields: ["related_alert"],
      },
    ],
  };
}
