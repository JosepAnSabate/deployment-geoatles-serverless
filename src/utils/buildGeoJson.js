export default async function buildGeoJson(positions, data) {
      for (let i = 0; i < positions.Count; i++) {
        data.features.push({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [
              parseFloat(positions.Items[i].lat), parseFloat(positions.Items[i].long)
            ]
          },
          "properties": {
            "id": positions.Items[i].id,
            "title": positions.Items[i].title,
            "description": positions.Items[i].description,
            "urlImg": positions.Items[i].urlImg,
            "date": positions.Items[i].date,
            "lat": positions.Items[i].lat,
            "long": positions.Items[i].long,
          }
        });
      }
      return data;
}
