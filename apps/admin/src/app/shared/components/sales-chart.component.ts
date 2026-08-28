import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, input } from '@angular/core';
import { Chart, Filler, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';

Chart.register(Filler, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip);

@Component({ selector: 'nova-sales-chart', standalone: true, template: '<canvas #chart aria-label="Revenue over time"></canvas>', styles: [':host{display:block;height:280px;min-width:0}canvas{width:100%!important;height:100%!important}'], changeDetection: ChangeDetectionStrategy.OnPush })
export class SalesChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chart', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  readonly compact = input(false);
  private chart?: Chart;
  ngAfterViewInit() {
    const labels = ['Jul 26','Jul 30','Aug 3','Aug 7','Aug 11','Aug 15','Aug 19','Aug 23'];
    this.chart = new Chart(this.canvas.nativeElement, { type: 'line', data: { labels, datasets: [{ label: 'Revenue', data: [6840,8220,7460,11080,9860,13640,12930,16480], borderColor: '#222724', backgroundColor: 'rgba(82,105,89,.12)', fill: true, tension: .38, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, pointHoverBackgroundColor: '#222724' }, { label: 'Previous period', data: [5900,7100,6650,8840,8120,10400,10980,11620], borderColor: '#b8bdb8', borderDash: [4,5], tension: .35, borderWidth: 1, pointRadius: 0 }] }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#171a18', padding: 12, displayColors: false, callbacks: { label: (context) => `$${Number(context.raw).toLocaleString()}` } } }, scales: { x: { grid: { display: false }, border: { display: false }, ticks: { color: '#858b87', font: { size: 9 } } }, y: { beginAtZero: true, grid: { color: 'rgba(35,40,37,.08)' }, border: { display: false }, ticks: { color: '#858b87', font: { size: 9 }, callback: (value) => `$${Number(value)/1000}k` } } } } });
  }
  ngOnDestroy() { this.chart?.destroy(); }
}
