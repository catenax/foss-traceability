import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { assign, concat, keys, map, pick } from 'lodash-es';
import { Moment } from 'moment';
import * as moment from 'moment/moment';
import { Observable } from 'rxjs';
import { AssetFilter } from 'src/app/assets/model/asset-filter.model';
import { QualityTypes } from 'src/app/quality-alert/model/quality-alert.model';
import { Table } from 'src/app/shared/components/table/table';
import { Asset } from 'src/app/shared/model/asset.model';
import { View } from 'src/app/shared/model/view.model';
import { InvestigationsFacade } from '../../abstraction/investigations.facade';
import { RaisedPartsTableBuilder } from '../../builder/raised-parts-table.builder';

/**
 *
 *
 * @export
 * @class InvestigationsRaiseAlertComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-investigations-raise-alert',
  templateUrl: './investigations-raise-alert.component.html',
  styleUrls: ['./investigations-raise-alert.component.scss'],
})
export class InvestigationsRaiseAlertComponent implements OnInit {
  /**
   * Selected date range
   *
   * @type {{ startDate: Moment; endDate: Moment }}
   * @memberof InvestigationsRaiseAlertComponent
   */
  public selected: { startDate: Moment; endDate: Moment };

  /**
   * Calendar available quick filter ranges
   *
   * @type {Record<string, Moment[]>}
   * @memberof InvestigationsRaiseAlertComponent
   */
  public ranges: Record<string, Moment[]>;

  /**
   * Date format
   *
   * @type {{
   *     format: string;
   *     displayFormat: string;
   *     customRangeLabel: string;
   *   }}
   * @memberof InvestigationsRaiseAlertComponent
   */
  public locale: {
    format: string;
    displayFormat: string;
    customRangeLabel: string;
  };

  /**
   * Raised alert form
   *
   * @type {FormGroup}
   * @memberof InvestigationsRaiseAlertComponent
   */
  public raiseForm: FormGroup;

  /**
   * Quality types
   *
   * @type {string[]}
   * @memberof InvestigationsRaiseAlertComponent
   */
  public types: string[];

  /**
   * Parts table
   *
   * @type {Table}
   * @memberof InvestigationsRaiseAlertComponent
   */
  public partsTable: Table;

  /**
   * Raised parts state
   *
   * @type {Observable<View<Asset[]>>}
   * @memberof InvestigationsRaiseAlertComponent
   */
  public raisedParts$: Observable<View<Asset[]>>;

  /**
   * Table filter
   *
   * @private
   * @type {AssetFilter}
   * @memberof InvestigationsRaiseAlertComponent
   */
  private filter: AssetFilter;

  /**
   * Is related parts expanded
   *
   * @type {boolean}
   * @memberof InvestigationsRaiseAlertComponent
   */
  public isExpanded: boolean;

  /**
   * Table selected rows
   *
   * @type {Asset[]}
   * @memberof InvestigationsRaiseAlertComponent
   */
  public selectedRows: Asset[];

  /**
   * @constructor InvestigationsRaiseAlertComponent
   * @param {InvestigationsFacade} investigationsFacade
   * @param {MatDialogRef<InvestigationsRaiseAlertComponent>} dialogRef
   * @param {{ serialNumbers: Asset[]; eventFlow: string }} data
   * @memberof InvestigationsRaiseAlertComponent
   */
  constructor(
    private investigationsFacade: InvestigationsFacade,
    public dialogRef: MatDialogRef<InvestigationsRaiseAlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { serialNumbers: Asset[]; eventFlow: string },
  ) {
    this.selected = {
      startDate: moment()
        .subtract(6, 'month')
        .startOf('month'),
      endDate: moment()
        .subtract(1, 'month')
        .endOf('month'),
    };
    this.types = keys(QualityTypes);
    this.raiseForm = this.investigationsFacade.investigationRaiseForm;
    this.partsTable = RaisedPartsTableBuilder.getTable();
    this.raisedParts$ = this.investigationsFacade.raisedParts$;
    this.investigationsFacade.setDatePickerProps();
    this.isExpanded = false;
    this.selectedRows = [];
  }

  /**
   * Angular lifecycle hook - On init
   *
   * @return {void}
   * @memberof InvestigationsRaiseAlertComponent
   */
  ngOnInit(): void {
    const [partNumberCustomer] = map(this.data?.serialNumbers, (asset: Asset) => asset.partNumberCustomer);
    const { startDate, endDate } = this.selected;

    this.filter = {
      partNumberCustomer: { value: partNumberCustomer },
      productionDateFrom: { value: startDate.toLocaleString() },
      productionDateTo: { value: endDate.toLocaleString() },
      type: { value: 'own' },
    };
    this.investigationsFacade.setRaisedParts(this.filter);
    const { locale, ranges } = this.investigationsFacade.datePickerProps;
    this.locale = locale;
    this.ranges = ranges;
  }

  /**
   * Calendar date setter
   *
   * @param {{ startDate: Moment; endDate: Moment }} filter
   * @return {void}
   * @memberof InvestigationsRaiseAlertComponent
   */
  public setDates(filter: { startDate: Moment; endDate: Moment }): void {
    const { startDate, endDate } = filter;
    this.filter = assign(pick(this.filter, ['partNumberCustomer', 'type']), {
      productionDateFrom: { value: startDate.toLocaleString() },
      productionDateTo: { value: endDate.toLocaleString() },
    });
    this.investigationsFacade.setRaisedParts(this.filter);
  }

  /**
   * Dialog close
   *
   * @return {void}
   * @memberof InvestigationsRaiseAlertComponent
   */
  public dialogClose(): void {
    this.dialogRef.close();
  }

  /**
   * Add to queue event
   *
   * @return {void}
   * @memberof InvestigationsRaiseAlertComponent
   */
  public addToQueue(): void {
    const assets: Asset[] = concat(...this.data.serialNumbers, ...this.selectedRows);
    this.dialogRef.close({
      qualityType: this.raiseForm.get('type').value,
      selectedSerialNumbers: assets,
      description: this.raiseForm.get('description').value,
      eventFlow: this.data.eventFlow,
    });
  }

  /**
   * Get selected rows event
   *
   * @param {SelectionModel<unknown>} rows
   * @return {void}
   * @memberof InvestigationsRaiseAlertComponent
   */
  public getSelectedRows(rows: SelectionModel<unknown>): void {
    this.selectedRows = rows.selected as Asset[];
  }
}
