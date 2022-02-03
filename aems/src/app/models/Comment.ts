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
export default function commentModel(sequelize: any, DataTypes: any) {
  return sequelize.define("comment", getCommentModelDefinition(DataTypes), getCommentModelIndices());
}

export function getCommentModelDefinition(DataTypes: any) {
  return {
    comment_id: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    alert_id: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    alert_origin_company: {
      type: DataTypes.TEXT,
    },
    alert_target_company: {
      type: DataTypes.TEXT,
    },
    company_name: {
      type: DataTypes.TEXT,
    },
    alert_message: {
      type: DataTypes.TEXT,
    },
  };
}

export function getCommentModelIndices() {
  return {
    tableName: "comments",
    timestamps: true,
    indexes: [
      {
        name: "comment_id_index",
        unique: false,
        fields: ["comment_id"],
      },
      {
        name: "alert_id_comment_index",
        unique: false,
        fields: ["alert_id"],
      },
      {
        name: "alert_origin_company_comment_index",
        unique: false,
        fields: ["alert_origin_company"],
      },
      {
        name: "alert_target_company_comment_index",
        unique: false,
        fields: ["alert_target_company"],
      },
      {
        name: "company_name_comment_index",
        unique: false,
        fields: ["company_name"],
      },
    ],
  };
}
