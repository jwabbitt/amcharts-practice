import React, { Component } from 'react';
import './App.css';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

import wasatchback from './assets/wasatchback'
import { calculateMapPoints } from './helpers/legElevations'

am4core.useTheme(am4themes_animated);

class App extends Component {
  componentDidMount() {
    // let chart = am4core.create("chartdiv", am4charts.XYChart);

    // chart.paddingRight = 20;

    // let data = [];

    // let visits = 10;
    // for (let i = 1; i < 366; i++) {
    //   visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
    //   data.push({ date: new Date(2018, 0, i), name: "name" + i, value: visits });
    // }

    // chart.data = data;

    // let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    // dateAxis.renderer.grid.template.location = 0;

    // let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    // valueAxis.tooltip.disabled = true;
    // valueAxis.renderer.minWidth = 35;

    // let series = chart.series.push(new am4charts.LineSeries());
    // series.dataFields.dateX = "date";
    // series.dataFields.valueY = "value";

    // series.tooltipText = "{valueY.value}";
    // chart.cursor = new am4charts.XYCursor();

    

    // this.chart = chart;


    // Legs Chart
    let legChart = am4core.create("legdiv", am4charts.XYChart);
    let legData = []
    let raceData = []
    let raceCalc = []

    let legs = wasatchback.data.legs;
    legs.forEach(leg => {
      let points = leg.points;

      leg.points.forEach(point => {
        raceData.push(point);
      })

      let leg_number = leg.leg_number;
      legData.push({leg_number, distanceToElevation: calculateMapPoints(points)})
    });


    //legChart.data = legData
    let distanceAxis = legChart.xAxes.push(new am4charts.ValueAxis());
    distanceAxis.title.text = "Distance (Miles)"
    let elevationAxis = legChart.yAxes.push(new am4charts.ValueAxis());
    elevationAxis.title.text = "Elevation (Feet)"

    let leg1 = legChart.series.push(new am4charts.LineSeries());
    leg1.dataFields.valueX = "distance"
    leg1.dataFields.valueY = "elevation"
    leg1.strokeWidth = 1
    leg1.name = "Leg 1"
    leg1.tooltipText = "{valueX.value}"
    leg1.stroke = am4core.color("#ff0000")
    leg1.data = legData[0]['distanceToElevation']

    let leg2 = legChart.series.push(new am4charts.LineSeries());
    leg2.dataFields.valueX = "distance"
    leg2.dataFields.valueY = "elevation"
    leg2.strokeWidth = 1
    leg2.name = "Leg 2"
    leg2.stroke = am4core.color("#0000ff")
    leg2.data = legData[1]['distanceToElevation']

    let leg3 = legChart.series.push(new am4charts.LineSeries());
    leg3.dataFields.valueX = "distance"
    leg3.dataFields.valueY = "elevation"
    leg3.strokeWidth = 1
    leg3.name = "Leg 3"
    leg3.stroke = am4core.color("#00ff00")
    leg3.data = legData[2]['distanceToElevation']

    let leg4 = legChart.series.push(new am4charts.LineSeries());
    leg4.dataFields.valueX = "distance"
    leg4.dataFields.valueY = "elevation"
    leg4.strokeWidth = 1
    leg4.name = "Leg 4"
    leg4.stroke = am4core.color("#00ffff")
    leg4.data = legData[3]['distanceToElevation']

    let leg5 = legChart.series.push(new am4charts.LineSeries());
    leg5.dataFields.valueX = "distance"
    leg5.dataFields.valueY = "elevation"
    leg5.strokeWidth = 1
    leg5.name = "Leg 5"
    leg5.stroke = am4core.color("#ffaa00")
    leg5.data = legData[4]['distanceToElevation']

    let leg6 = legChart.series.push(new am4charts.LineSeries());
    leg6.dataFields.valueX = "distance"
    leg6.dataFields.valueY = "elevation"
    leg6.strokeWidth = 1
    leg6.name = "Leg 6"
    leg6.stroke = am4core.color("#ff00aa")
    leg6.data = legData[5]['distanceToElevation']

    legChart.legend = new am4charts.Legend();
    legChart.cursor = new am4charts.XYCursor();
    legChart.cursor.maxTooltipDistance = 0;

    leg1.tooltipText = "{valueX}: [bold]{valueY}[/]";

    this.legChart = legChart;


    // Ragnar Race Chart
    let ragnarChart = am4core.create("ragnardiv", am4charts.XYChart);

    raceCalc.push({distanceToElevation: calculateMapPoints(raceData)});

    console.log(raceCalc);


    //ragnarChart.data = legData
    let raceDistanceAxis = ragnarChart.xAxes.push(new am4charts.ValueAxis());
    raceDistanceAxis.title.text = "Distance (Miles)";
    let raceElevationAxis = ragnarChart.yAxes.push(new am4charts.ValueAxis());
    raceElevationAxis.title.text = "Elevation (Feet)";

    let ragnarData = ragnarChart.series.push(new am4charts.LineSeries());
    ragnarData.dataFields.valueX = "distance"
    ragnarData.dataFields.valueY = "elevation"
    ragnarData.strokeWidth = 1
    ragnarData.tooltipText = "{valueX.value}"
    ragnarData.stroke = am4core.color("#ddaa00")
    ragnarData.data = raceCalc[0]['distanceToElevation'];

    let scrollbarX = new am4charts.XYChartScrollbar();
    scrollbarX.series.push(ragnarData);
    ragnarChart.scrollbarX = scrollbarX;

    ragnarChart.cursor = new am4charts.XYCursor();
    ragnarData.tooltipText = "{valueX}: [bold]{valueY}[/]";

    this.ragnarChart = ragnarChart;

  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  render() {
    return (
      <div>
        {/* <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div> */}
        <div id="legdiv" style={{ width: "100%", height: "500px" }}></div>
        <div id="ragnardiv" style={{ width: "100%", height: "500px" }}></div>
      </div>
      
    );
  }
}

export default App;