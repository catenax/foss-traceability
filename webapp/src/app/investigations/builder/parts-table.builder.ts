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

import { ColumnConfig } from '../../shared/components/table/column-config';
import { ColumnType } from '../../shared/components/table/column-type';
import { TableFactory } from '../../shared/components/table/table-factory';
import { Table } from '../../shared/components/table/table';
import { TableConfig } from '../../shared/components/table/table-config';

/**
 *
 *
 * @export
 * @class PartsTableBuilder
 */
export class PartsTableBuilder {
  /**
   * Table builder
   *
   * @static
   * @return {Table}
   * @memberof AssetListTableBuilder
   */
  static getTable(): Table {
    const detailColumns: Array<ColumnConfig> = [
      {
        fieldName: 'partNameManufacturer',
        label: 'Part Name',
        hide: false,
        width: 4,
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
        label: 'Serial Number',
        hide: false,
        width: 5,
        sortable: true,
        type: ColumnType.COPY_STRING,
      },
    ];

    // build the table that contains the details
    const detailTable: Table = TableFactory.buildTable(
      detailColumns,
      new TableConfig(true, { emptyStateReason: 'No data available' }),
    );
    const columnsConfig: Array<ColumnConfig> = [
      {
        fieldName: 'partNameManufacturer',
        childFieldName: 'childComponents',
        label: 'Part Name',
        hide: false,
        sortable: true,
        width: 2,
        type: ColumnType.TABLE,
        detailTable,
      },
      {
        fieldName: 'partNumberManufacturer',
        label: 'Part Number',
        hide: false,
        sortable: true,
      },
      {
        fieldName: 'serialNumberCustomer',
        label: 'Serial Number',
        hide: false,
        width: 6,
        sortable: false,
        type: ColumnType.COPY_STRING,
      },
    ];
    return TableFactory.buildTable(columnsConfig, new TableConfig(true, { emptyStateReason: 'No data available' }));
  }
}
