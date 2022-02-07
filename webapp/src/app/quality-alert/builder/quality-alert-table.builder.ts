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

import { ColumnConfig } from 'src/app/shared/components/table/column-config';
import { ColumnType } from 'src/app/shared/components/table/column-type';
import { Table } from 'src/app/shared/components/table/table';
import { TableConfig } from 'src/app/shared/components/table/table-config';
import { TableFactory } from 'src/app/shared/components/table/table-factory';

/**
 *
 *
 * @export
 * @class QualityAlertTableBuilder
 */
export class QualityAlertTableBuilder {
  /**
   * Quality type table
   *
   * @static
   * @return {Table}
   * @memberof QualityAlertTableBuilder
   */
  static getTable(): Table {
    const columnsConfig: Array<ColumnConfig> = [
      {
        fieldName: 'partNameManufacturer',
        label: 'Part Name',
        hide: false,
        width: 2,
        sortable: true,
      },
      {
        fieldName: 'partNumberManufacturer',
        label: 'Part Number',
        hide: false,
        width: 2,
        sortable: true,
      },
      {
        fieldName: 'serialNumberCustomer',
        label: 'Serial Number Customer',
        hide: false,
        width: 5,
        type: ColumnType.COPY_STRING,
      },
    ];

    return TableFactory.buildTable(columnsConfig, new TableConfig(false, { emptyStateReason: 'No data available' }));
  }
}
