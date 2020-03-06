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

    let strokeWidth = 3;

    let leg1 = legChart.series.push(new am4charts.LineSeries());
    leg1.dataFields.valueX = "distance"
    leg1.dataFields.valueY = "elevation"
    leg1.strokeWidth = strokeWidth
    leg1.name = "Leg 1"
    leg1.tooltipText = "{valueX.value}"
    leg1.stroke = am4core.color("#4285f4")
    leg1.data = legData[0]['distanceToElevation']

    let leg2 = legChart.series.push(new am4charts.LineSeries());
    leg2.dataFields.valueX = "distance"
    leg2.dataFields.valueY = "elevation"
    leg2.strokeWidth = strokeWidth
    leg2.name = "Leg 2"
    leg2.stroke = am4core.color("#db4437")
    leg2.data = legData[1]['distanceToElevation']

    let leg3 = legChart.series.push(new am4charts.LineSeries());
    leg3.dataFields.valueX = "distance"
    leg3.dataFields.valueY = "elevation"
    leg3.strokeWidth = strokeWidth
    leg3.name = "Leg 3"
    leg3.stroke = am4core.color("#f4b400")
    leg3.data = legData[2]['distanceToElevation']

    let leg4 = legChart.series.push(new am4charts.LineSeries());
    leg4.dataFields.valueX = "distance"
    leg4.dataFields.valueY = "elevation"
    leg4.strokeWidth = strokeWidth
    leg4.name = "Leg 4"
    leg4.stroke = am4core.color("#0f9d58")
    leg4.data = legData[3]['distanceToElevation']

    let leg5 = legChart.series.push(new am4charts.LineSeries());
    leg5.dataFields.valueX = "distance"
    leg5.dataFields.valueY = "elevation"
    leg5.strokeWidth = strokeWidth
    leg5.name = "Leg 5"
    leg5.stroke = am4core.color("#ff6d00")
    leg5.data = legData[4]['distanceToElevation']

    let leg6 = legChart.series.push(new am4charts.LineSeries());
    leg6.dataFields.valueX = "distance"
    leg6.dataFields.valueY = "elevation"
    leg6.strokeWidth = strokeWidth
    leg6.name = "Leg 6"
    leg6.stroke = am4core.color("#46bdc6")
    leg6.data = legData[5]['distanceToElevation']

    legChart.legend = new am4charts.Legend();
    legChart.cursor = new am4charts.XYCursor();
  

    leg1.tooltipText = "{valueX}: [bold]{valueY}[/]";

    legChart.scrollbarX = new am4core.Scrollbar();

    this.legChart = legChart;
    console.log(legData)


    // Ragnar Race Chart
    let ragnarChart = am4core.create("ragnardiv", am4charts.XYChart);

    raceCalc.push({distanceToElevation: calculateMapPoints(raceData)});

    console.log(JSON.stringify(raceCalc));


    //ragnarChart.data = legData
    let raceDistanceAxis = ragnarChart.xAxes.push(new am4charts.ValueAxis());
    raceDistanceAxis.title.text = "Distance (Miles)";
    let raceElevationAxis = ragnarChart.yAxes.push(new am4charts.ValueAxis());
    raceElevationAxis.title.text = "Elevation (Feet)";

    let ragnarData = ragnarChart.series.push(new am4charts.LineSeries());
    ragnarData.dataFields.valueX = "distance"
    ragnarData.dataFields.valueY = "elevation"
    ragnarData.strokeWidth = strokeWidth
    ragnarData.stroke = am4core.color("#ffaa00")
    // ragnarData.tooltipText = "hello"
    // ragnarData.showTooltipOn = "always" 
    
    ragnarChart.data = raceCalc[0]['distanceToElevation'];

    let scrollbarX = new am4charts.XYChartScrollbar();
    scrollbarX.series.push(ragnarData);
    ragnarChart.scrollbarX = scrollbarX;

    ragnarChart.cursor = new am4charts.XYCursor();
    ragnarChart.cursor.lineY.disabled = true
    ragnarChart.cursor.lineX.strokeDasharray= "";
    
    // ragnarChart.cursor.snapToSeries = ragnarData

    // Create Custom Tool Tip
    let customToolTip = ragnarChart.createChild(am4core.Tooltip);
    customToolTip.fontSize = 14;
    customToolTip.autoTextColor = false;
    customToolTip.label.fill = am4core.color("#000");
    customToolTip.background.fill = am4core.color("#ffaa00");
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
        let yOffset = ragnarChart.plotContainer.pixelY + 80;
        
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