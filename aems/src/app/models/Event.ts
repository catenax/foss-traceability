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
 * Event model
 * @param sequelize
 * @param DataTypes
 * @constructor
 */
export default function EventModel(sequelize: any, DataTypes: any) {
  return sequelize.define("event", getEventModelDefinition(DataTypes), getEventModelIndices());
}

export function getEventModelDefinition(DataTypes: any) {
  return {
    event_uid: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    alert_id: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    event_origin_company: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    event_target_company: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    event_origin: {
      type: DataTypes.TEXT,
    },
    event_type: {
      type: DataTypes.TEXT,
    },
    event_status: {
      type: DataTypes.TEXT,
    },
    propagated: {
      type: DataTypes.BOOLEAN,
    },
    event_flow: {
      type: DataTypes.TEXT,
    },
    event_relation: {
      type: DataTypes.TEXT,
    },
    origin_partner_name: {
      type: DataTypes.TEXT,
    },
  };
}

export function getEventModelIndices() {
  return {
    tableName: "events",
    timestamps: true,
    indexes: [
      {
        name: "event_alert_id_index",
        unique: false,
        fields: ["alert_id"],
      },
      {
        name: "event_uid_index",
        unique: false,
        fields: ["event_uid"],
      },
      {
        name: "event_origin_company_index",
        unique: false,
        fields: ["event_origin_company"],
      },
      {
        name: "event_target_company_index",
        unique: false,
        fields: ["event_target_company"],
      },
      {
        name: "event_type_index",
        unique: false,
        fields: ["event_type"],
      },
      {
        name: "propagated_index",
        unique: false,
        fields: ["propagated"],
      },
      {
        name: "event_status_index",
        unique: false,
        fields: ["event_status"],
      },
    ],
  };
}
