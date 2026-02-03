declare module 'togeojson' {
  const toGeoJSON: {
    kml: (doc: Document) => GeoJSON.FeatureCollection;
    gpx: (doc: Document) => GeoJSON.FeatureCollection;
  };
  export default toGeoJSON;
}
