declare module 'togeojson' {
  export default {
    kml: (doc: Document) => any;
    gpx: (doc: Document) => any;
  };
}
