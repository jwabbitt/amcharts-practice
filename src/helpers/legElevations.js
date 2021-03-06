const calDistance = (lat1, lon1, lat2, lon2, unit) => {
	if ((lat1 === lat2) && (lon1 === lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit==="K") { dist = dist * 1.609344 }
		if (unit==="N") { dist = dist * 0.8684 }
		return dist;
	}
}

export const calculateMapPoints = points => {
    let distance = 0
    let i = 0
    let prevLat, prevLon
    let calculatedMapPoints = points.map(data => {
        if (i === 0) {distance = 0} else {
            distance += calDistance(prevLat, prevLon, data.lat, data.lon, "M")
        }
        i = i + 1
        prevLat = data.lat
        prevLon = data.lon
        let elevation = data.ele
		let toFeet = parseFloat(elevation) * 39.37 /12
		if(data.runner_number) {
			let runnerMileData = "runner" + data.runner_number + "MileData"
			return({leg_number: data.leg_number, runner_number: data.runner_number, [runnerMileData]: distance, elevation: toFeet, distance})
		}
        return ({distance, elevation: toFeet})
        
    })
    
    return calculatedMapPoints
}

export const getLatLon = points => {
	let latLonPoints = points.map(data => {
		return ({lat: data.lat, lng: data.lon})
	})
	return latLonPoints
}
