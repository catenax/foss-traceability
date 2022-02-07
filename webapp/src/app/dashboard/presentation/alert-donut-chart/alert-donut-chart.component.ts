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

// TODO ADJUST THE TYPES FOR THOSE D3 VARIABLES

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { min, orderBy, ceil, values, keys, map } from 'lodash-es';
import { QualityTypes } from 'src/app/quality-alert/model/quality-alert.model';
import { ReceivedAlertType } from '../../model/dashboard.model';

/**
 *
 *
 * @export
 * @class AlertDonutChartComponent
 * @implements {OnChanges}
 */
@Component({
  selector: 'app-alert-donut-chart',
  templateUrl: './alert-donut-chart.component.html',
})
export class AlertDonutChartComponent implements OnChanges {
  /**
   * Donut chart alerts data
   *
   * @type {ReceivedAlertType[]}
   * @memberof AlertDonutChartComponent
   */
  @Input() chartData: ReceivedAlertType[];

  /**
   * Donut chart container
   *
   * @type {ElementRef}
   * @memberof AlertDonutChartComponent
   */
  @ViewChild('donutContainer', { static: true }) chart: ElementRef;

  /**
   * Svg container
   *
   * @private
   * @type {any}
   * @memberof AlertDonutChartComponent
   */
  private svg: any;

  /**
   * Chart color scale
   *
   * @private
   * @type {*}
   * @memberof AlertDonutChartComponent
   */
  private colorScale: any;

  /**
   * Chart arc
   *
   * @private
   * @type {*}
   * @memberof AlertDonutChartComponent
   */
  private arc: any;

  /**
   * Svg width
   *
   * @private
   * @type {number}
   * @memberof AlertDonutChartComponent
   */
  private width = 400;

  /**
   * Svg height
   *
   * @private
   * @type {number}
   * @memberof AlertDonutChartComponent
   */
  private height = 300;

  /**
   * Donut chart
   *
   * @private
   * @type {any}
   * @memberof AlertDonutChartComponent
   */
  private pie: any;

  /**
   * Chart legend
   *
   * @private
   * @type {any}
   * @memberof AlertDonutChartComponent
   */
  private legend: any;

  /**
   * legend container
   *
   * @private
   * @type {any}
   * @memberof AlertDonutChartComponent
   */
  private legendHolder: any;

  /**
   * Chart tooltip
   *
   * @private
   * @type {any}
   * @memberof AlertDonutChartComponent
   */
  private tooltip: any;

  /**
   * Mouse leave function
   *
   * @private
   * @type {any}
   * @memberof AlertDonutChartComponent
   */
  private mouseLeave: any;

  /**
   * Mouse over function
   *
   * @private
   * @type {any}
   * @memberof AlertDonutChartComponent
   */
  private mouseOver: any;

  /**
   * Mouse move function
   *
   * @private
   * @type {any}
   * @memberof AlertDonutChartComponent
   */
  private mouseMove: any;

  /**
   * Angular lifecycle - Ng on changes
   *
   * @param {SimpleChanges} changes
   * @memberof AlertDonutChartComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.chartData.currentValue) {
      this.updateChart(changes.chartData.currentValue);
    }
  }

  /**
   * Updates chart
   *
   * @private
   * @param {ReceivedAlertType[]} data
   * @returns {void}
   * @memberof AlertDonutChartComponent
   */
  private updateChart(data: ReceivedAlertType[]): void {
    if (!this.svg) {
      this.createChart(data);
    }
  }

  /**
   * Chart builder
   *
   * @private
   * @param {ReceivedAlertType[]} data
   * @return {void}
   * @memberof AlertDonutChartComponent
   */
  private createChart(data: ReceivedAlertType[]): void {
    this.removeExistingChartFromParent();
    this.setChartDimensions();
    this.createTooltip();
    this.setMouseOver();
    this.setMouseMove();
    this.setMouseLeave();
    this.setColorScale(data);
    this.setArcs();
    this.setPie();
    const arcs = this.pie(data);
    this.svgPath(arcs);
    this.appendLabels(arcs);
    this.appendLegends(arcs);
  }

  /**
   * Tooltip builder
   *
   * @private
   * @return {void}
   * @memberof AlertDonutChartComponent
   */
  private createTooltip(): void {
    this.tooltip = d3
      .select(this.chart.nativeElement)
      .append('div')
      .style('background-color', '#444')
      .style('font-size', '12px')
      .style('color', '#fff')
      .style('padding', '0.5rem')
      .style('z-index', 20)
      .style('position', 'fixed')
      .style('text-align', 'center')
      .style('border-radius', '5px')
      .style('width', '150px')
      .style('opacity', 0);
  }

  /**
   * Attach arcs to the pie chart
   *
   * @private
   * @param {*} arcs
   * @return {void}
   * @memberof AlertDonutChartComponent
   */
  private svgPath(arcs: any): void {
    this.svg
      .append('g')
      .attr('transform', 'translate(' + 0 + ',' + 30 + ')')
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('fill', d => this.colorScale(d.data.type))
      .attr('d', this.arc)
      .on('mouseover', this.mouseOver)
      .on('mousemove', this.mouseMove)
      .on('mouseleave', this.mouseLeave);
  }

  /**
   * Append labels in the chart
   *
   * @private
   * @param {*} arcs
   * @return {void}
   * @memberof AlertDonutChartComponent
   */
  private appendLabels(arcs: any): void {
    this.svg
      .append('g')
      .attr('transform', 'translate(' + 0 + ',' + 30 + ')')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 16)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 700)
      .attr('line-height', 24)
      .selectAll('text')
      .data(arcs)
      .join('text')
      .attr('transform', d => `translate(${this.arc.centroid(d)})`)
      .call(text =>
        text
          .append('tspan')
          .attr('x', 0)
          .attr('y', '0.7em')
          .text(d => this.calculatePercentage(d.data.total))
          .style('fill', d => this.setLabelColor(d.data.type)),
      );
  }

  /**
   * Append labels to the legend holder container
   *
   * @private
   * @param {*} arcs
   * @return {void}
   * @memberof AlertDonutChartComponent
   */
  private appendLegends(arcs: any): void {
    this.legend = this.legendHolder
      .selectAll('legend')
      .data(arcs)
      .enter()
      .append('g')
      .attr('transform', (d, i) => 'translate(' + (i * 80 + 0) + ',' + 5 + ')')
      .attr('class', 'legend');

    this.legend
      .append('circle')
      .attr('cx', 5)
      .attr('cy', 5)
      .attr('r', 5)
      .attr('fill', d => this.colorScale(d.data.type));

    this.legend
      .append('text')
      .text(d => d.data.type)
      .style('font-size', 12)
      .attr('color', '#000')
      .attr('y', 10)
      .attr('x', 20);
  }

  /**
   * Appends the svg's to the container element
   *
   * @private
   * @return {void}
   * @memberof AlertDonutChartComponent
   */
  private setChartDimensions(): void {
    this.legendHolder = d3
      .select(this.chart.nativeElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '30px')
      .attr('transform', 'translate(' + 0 + ',' + 5 + ')');

    this.svg = d3
      .select(this.chart.nativeElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '350px')
      .attr('viewBox', [-this.width / 2 + 30, -this.height / 2, this.width - 50, this.height + 50].toString());
  }

  /**
   * Donut char color scale
   *
   * @private
   * @param {ReceivedAlertType[]} data
   * @return {void}
   * @memberof AlertDonutChartComponent
   */
  private setColorScale(data: ReceivedAlertType[]): void {
    this.colorScale = d3
      .scaleOrdinal()
      .domain(
        orderBy(
          data.map(alert => alert.type),
          ['type', 'asc'],
        ),
      )
      .range(map(values(data.filter(alert => keys(QualityTypes).includes(alert.type))), 'color'));
  }

  /**
   * Donut chart arcs setter
   *
   * @private
   * @return {void}
   * @memberof AlertDonutChartComponent
   */
  private setArcs(): void {
    const radius = min([this.width, this.height]) / 2;
    this.arc = d3
      .arc()
      .innerRadius(radius * 0.67)
      .outerRadius(radius - 1);
  }

  /**
   * Donut chart setter
   *
   * @private
   * @return {void}
   * @memberof AlertDonutChartComponent
   */
  private setPie(): void {
    this.pie = d3
      .pie<ReceivedAlertType>()
      .padAngle(0.01)
      .sort(null)
      .value(d => d.total);
  }

  /**
   * Mouse over setter
   *
   * @private
   * @return {void}
   * @memberof AlertDonutChartComponent
   */
  private setMouseOver(): void {
    this.mouseOver = () => this.tooltip.style('opacity', 1);
  }

  /**
   * Mouse leave setter
   *
   * @private
   * @return {void}
   * @memberof AlertDonutChartComponent
   */
  private setMouseLeave(): void {
    this.mouseLeave = () => this.tooltip.style('opacity', 0);
  }

  /**
   * Mouse move setter
   *
   * @private
   * @return {void}
   * @memberof AlertDonutChartComponent
   */
  private setMouseMove(): void {
    this.mouseMove = (event, data) => {
      this.tooltip
        .text(this.assembleLabel(data.data))
        .style('left', `${event.clientX + 10}px`)
        .style('top', `${event.clientY + 15}px`)
        .style('opacity', 1);
    };
  }

  /**
   * Removes the current svg from the container element
   *
   * @private
   * @return {void}
   * @memberof AlertDonutChartComponent
   */
  private removeExistingChartFromParent(): void {
    // !!!!Caution!!!
    // Make sure not to do;
    //     d3.select('svg').remove();
    // That will clear all other SVG elements in the DOM
    d3.select(this.chart.nativeElement)
      .select('svg')
      .remove();
  }

  /**
   * Percentage calculations for the chart
   *
   * @private
   * @param {number} total
   * @return {string}
   * @memberof AlertDonutChartComponent
   */
  private calculatePercentage(total: number): string {
    const totalOfAlerts: number = this.chartData.map(alert => alert.total).reduce((acc, curr) => acc + curr, 0);
    return `${ceil((total / totalOfAlerts) * 100).toLocaleString()}%`;
  }

  /**
   * Text color for the chart labels
   *
   * @private
   * @param {string} type
   * @return {string}
   * @memberof AlertDonutChartComponent
   */
  private setLabelColor(type: string): string {
    return type.includes('LIFE-THREATENING') || type.includes('CRITICAL') ? '#fff' : '#000';
  }

  /**
   * Tooltip label assembler
   *
   * @private
   * @param {ReceivedAlertType} data
   * @return {string}
   * @memberof AlertDonutChartComponent
   */
  private assembleLabel(data: ReceivedAlertType): string {
    const label = data.total === 1 ? 'part' : 'parts';
    return `${data.total} ${label} with ${data.type.toLocaleLowerCase()} issues`;
  }
}
