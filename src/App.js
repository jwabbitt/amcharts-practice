import React, { Component } from 'react';
import './App.css';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

import wasatchback from './assets/wasatchback'
import { calculateMapPoints, getLatLon } from './helpers/legElevations'

am4core.useTheme(am4themes_animated);

class App extends Component {
  componentDidMount() {
    let runnerColors = ['#4285f4', '#db4437', '#f4b400', '#0f9d58', '#ff6d00', '#46bdc6',
                        '#ff00ff', '#9955ff', '#0000ff', '#00ffff', '#980000', '#00ff00']

    let strokeWidth = 3;

    let fullRace =[]
    let race = []
    let legData = []
    let latLon = []

    let legs = wasatchback.data.legs;
    legs.forEach(leg => {
      let points = leg.points;
      
      let leg_number = leg.leg_number;
      let runner_number = leg.leg_number % 12
      runner_number === 0 ? runner_number = 12 : runner_number = runner_number + 0

      // For Full Race Chart
      leg.points.forEach(point => {
        fullRace.push({leg_number: leg_number, runner_number, lat: point.lat, lon: point.lon, ele: point.ele});
      })

      // For Leg Charts
      legData.push({leg_number, distanceToElevation: calculateMapPoints(points)})

      // For Google Maps API
      latLon.push({leg_number, latLonPoints: getLatLon(points)})
    });


    // ------------ LEGS CHART --------------
    let legChart = am4core.create("legdiv", am4charts.XYChart);

    let legChartTitle = legChart.titles.create();
    legChartTitle.text = "Van 1 - 1st Session";
    legChartTitle.fontSize = 25;
    legChartTitle.marginBottom = 30;
    legChartTitle.align = "left"

    let distanceAxis = legChart.xAxes.push(new am4charts.ValueAxis());
    distanceAxis.title.text = "Distance (Miles)"
    let elevationAxis = legChart.yAxes.push(new am4charts.ValueAxis());
    elevationAxis.title.text = "Elevation (Feet)"

    let createLegSeries = (seriesData, name, color) => {
      console.log("seriesDataString: " + seriesData)
      let legSeries = legChart.series.push(new am4charts.LineSeries());
      legSeries.dataFields.valueX = "distance"
      legSeries.dataFields.valueY = "elevation"
      legSeries.strokeWidth = strokeWidth
      legSeries.name = name
      legSeries.tooltipText = "{valueX.value}"
      legSeries.stroke = am4core.color(color)
      legSeries.connect = false
      legSeries.data = seriesData

      return createLegSeries
    }

    for (let i = 0; i < 6; i++) {
      let name = "Leg " + (i + 1)
      createLegSeries(legData[i]['distanceToElevation'], name, runnerColors[i])
    }

    legChart.legend = new am4charts.Legend();
    legChart.cursor = new am4charts.XYCursor();

    legChart.scrollbarX = new am4core.Scrollbar();

    this.legChart = legChart;


    // ----------- RAGNAR RACE CHART -------------
    let ragnarChart = am4core.create("ragnardiv", am4charts.XYChart);

    race.push(calculateMapPoints(fullRace))
    
    console.log(race[0]);

    let ragnarChartTitle = ragnarChart.titles.create();
    ragnarChartTitle.text = "Wasatch Back Full Race";
    ragnarChartTitle.fontSize = 25;
    ragnarChartTitle.marginBottom = 30;
    ragnarChartTitle.align = "left";

    let raceDistanceAxis = ragnarChart.xAxes.push(new am4charts.ValueAxis());
    raceDistanceAxis.title.text = "Distance (Miles)";
    let raceElevationAxis = ragnarChart.yAxes.push(new am4charts.ValueAxis());
    raceElevationAxis.title.text = "Elevation (Feet)";

    let ragnarData = ragnarChart.series.push(new am4charts.LineSeries());
    ragnarData.dataFields.valueX = "distance"
    ragnarData.dataFields.valueY = "elevation"
    ragnarData.strokeWidth = strokeWidth
    ragnarData.name = "Full Race"
    ragnarData.stroke = am4core.color("#ddd")
    ragnarData.data = race[0];
    
    ragnarChart.data = race[0];

    let scrollbarX = new am4charts.XYChartScrollbar();
    scrollbarX.series.push(ragnarData);
    ragnarChart.scrollbarX = scrollbarX;

    ragnarChart.cursor = new am4charts.XYCursor();
    ragnarChart.cursor.lineY.disabled = true
    ragnarChart.cursor.lineX.strokeDasharray= "";

    // Create Custom Tool Tip
    let customToolTip = ragnarChart.createChild(am4core.Tooltip);
    customToolTip.fontSize = 14;
    customToolTip.autoTextColor = false;
    customToolTip.label.fill = am4core.color("#000");
    customToolTip.background.fill = am4core.color("#ddd");
    customToolTip.background.opacity = ".8"
    customToolTip.pointerOrientation = "horizontal";

    ragnarChart.plotContainer.events.on("out", function(ev) {
        customToolTip.hide();
    });

    ragnarChart.plotContainer.events.on("over", function(ev) {
        //customToolTip.appear();
        customToolTip.show();
    });

    var last_idx = -1;

    ragnarChart.cursor.events.on("cursorpositionchanged", function(ev) {
      // get cursor x coordinate
      let xAxis = ev.target.chart.xAxes.getIndex(0);
      let yAxis = ev.target.chart.yAxes.getIndex(0);
      
      let x = xAxis.positionToValue(xAxis.toAxisPosition(ev.target.xPosition));
      
      // search closest data point
      let idx = searchval(x);
      
      // tooltip update only after data point change
      if(idx !== last_idx) {
        // data point coordinates
        let xpos = xAxis.valueToPoint(ragnarChart.data[idx].distance);
        let ypos = yAxis.valueToPoint(ragnarChart.data[idx].elevation);
        // plot container offset
        let xOffset = ragnarChart.plotContainer.pixelX;
        let yOffset = ragnarChart.plotContainer.pixelY + 140;
        
        let txt = round(ragnarChart.data[idx].elevation, 2) + " Feet\n" + round(ragnarChart.data[idx].distance, 2) + " Miles";
        //txt = txt  + "\nxpos: "+ xpos.x + "\nypos: "+ypos.y + "\nxOff: " + xOffset;
        //console.log(txt);

        // set content and move to data point
        customToolTip.text = txt;
        customToolTip.pointTo({"x": xpos.x + xOffset, "y": ypos.y + yOffset});
        customToolTip.pointerOrientation = "left"
        
        last_idx = idx;
      }
    });

    function searchval(x) {
        let center;
        let left = 0;
        let maxidx = ragnarChart.data.length - 1;
        let right = maxidx;
        
        // bisect data array 
        // worst-case performance: O(log2(n))
        while (left < right) {  
            center = Math.floor((left + right) / 2);

            if(ragnarChart.data[center].distance < x) {
                left = center + 1;
            }
            else {
                right = center;
            }   
        }
        
        // check which data point is closer to the cursor
        if(x > ragnarChart.data[center].distance) {
            if((center < maxidx) && (x - ragnarChart.data[center].distance) > (ragnarChart.data[center + 1].distance - x)) {
                center = center + 1;
            }
        }   

        if(x < ragnarChart.data[center].distance) {
            if((center > 0) && (ragnarChart.data[center].distance - x) > (x - ragnarChart.data[center - 1].distance)) {
                center = center - 1;
            }
        }
        
        return center;
    }

    function round(value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }

    let createRagnarSeries = (seriesData, name, color) => {
      console.log("seriesDataString: " + seriesData)
      let ragnarSeries = ragnarChart.series.push(new am4charts.LineSeries());
      ragnarSeries.dataFields.valueX = "distance"
      ragnarSeries.dataFields.valueY = "elevation"
      ragnarSeries.strokeWidth = strokeWidth
      ragnarSeries.name = name
      ragnarSeries.tooltipText = "{valueX.value}"
      ragnarSeries.stroke = am4core.color(color)
      ragnarSeries.connect = false
      ragnarSeries.data = seriesData

      return ragnarSeries
    }

    for (let i=0; i < 12; i++) {
      let runnerData = []
      race[0].map(data => {
        if (data.runner_number === i + 1) {
          runnerData.push({distance: data.distance, elevation: data.elevation})
        } else {
          runnerData.push({})
        }
        return runnerData
      })
      let nameString = "Runner " + (i+1)
      let colorString = runnerColors[i]
      createRagnarSeries(runnerData, nameString, colorString)
    }

    ragnarChart.legend = new am4charts.Legend();

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
        <div id="legdiv" style={{ width: "100%", height: "500px" }}></div>
        <div id="ragnardiv" style={{ width: "100%", height: "500px" }}></div>
      </div>
      
    );
  }
}

export default App;