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
 * Alert model
 * @param sequelize
 * @param DataTypes
 * @constructor
 */
export default function AlertModel(sequelize: any, DataTypes: any) {
  return sequelize.define("alert", getAlertModelDefinition(DataTypes), getAlertModelIndices());
}

export function getAlertModelDefinition(DataTypes: any) {
  return {
    alert_id: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    serial_number_customer: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    child_serial_number_customer: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    quality_type: {
      type: DataTypes.TEXT,
    },
    quality_alert: {
      type: DataTypes.BOOLEAN,
    },
    mspid: {
      type: DataTypes.TEXT,
    },
    customer_oneid: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.TEXT,
    },
    propagated: {
      type: DataTypes.BOOLEAN,
    },
    app_name: {
      type: DataTypes.TEXT,
    },
    history: {
      type: DataTypes.JSONB,
    },
    part_name_manufacturer: {
      type: DataTypes.TEXT,
    },
    part_number_manufacturer: {
      type: DataTypes.TEXT,
    },
    child_part_name_manufacturer: {
      type: DataTypes.TEXT,
    },
    child_part_number_manufacturer: {
      type: DataTypes.TEXT,
    },
    child_customer_oneid: {
      type: DataTypes.TEXT,
    },
  };
}

export function getAlertModelIndices() {
  return {
    tableName: "alerts",
    timestamps: true,
    indexes: [
      {
        name: "serial_number_customer_alert_index",
        unique: false,
        fields: ["serial_number_customer"],
      },
      {
        name: "child_serial_number_customer_alert_index",
        unique: false,
        fields: ["child_serial_number_customer"],
      },
      {
        name: "quality_alert_alert_index",
        unique: false,
        fields: ["quality_alert"],
      },
      {
        name: "quality_type_index",
        unique: false,
        fields: ["quality_type"],
      },
      {
        name: "status_alert_index",
        unique: false,
        fields: ["status"],
      },
      {
        name: "mspid_alert_index",
        unique: false,
        fields: ["mspid"],
      },
      {
        name: "customer_oneid_alert_index",
        unique: false,
        fields: ["customer_oneid"],
      },
      {
        name: "app_name_index",
        unique: false,
        fields: ["app_name"],
      },
      {
        name: "quality_alert_part_name_manufacturer_index",
        unique: false,
        fields: ["part_name_manufacturer"],
      },
      {
        name: "quality_alert_part_number_manufacturer_index",
        unique: false,
        fields: ["part_number_manufacturer"],
      },
      {
        name: "quality_alert_child_customer_oneid_index",
        unique: false,
        fields: ["child_customer_oneid"],
      },
    ],
  };
}
