import { ColumnConfig } from '../../shared/components/table/column-config';
import { ColumnType } from '../../shared/components/table/column-type';
import { TableFactory } from '../../shared/components/table/table-factory';
import { Table } from '../../shared/components/table/table';
import { TableConfig } from '../../shared/components/table/table-config';

/**
 *
 *
 * @export
 * @class RaisedPartsTableBuilder
 */
export class RaisedPartsTableBuilder {
  /**
   * Table builder
   *
   * @static
   * @return {Table}
   * @memberof RaisedPartsTableBuilder
   */
  static getTable(): Table {
    const columnsConfig: Array<ColumnConfig> = [
      {
        fieldName: 'partNameManufacturer',
        childFieldName: 'childComponents',
        label: 'Part Name',
        hide: false,
        sortable: true,
        width: 2,
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
      {
        fieldName: 'statusIcon',
        label: 'Quality Type',
        hide: false,
        width: 2,
        type: ColumnType.STATUS_STRING,
      },
      {
        fieldName: 'productionDateGmt',
        label: 'Production Date',
        hide: false,
        type: ColumnType.DATE,
        sortable: true,
        width: 2,
      },
    ];
    return TableFactory.buildTable(columnsConfig, new TableConfig(true, { emptyStateReason: 'No data available' }));
  }
}
