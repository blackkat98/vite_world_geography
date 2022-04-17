import './style.css'
import {
  Map,
  View,
} from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import XYZ from 'ol/source/XYZ'
import Stamen from 'ol/source/Stamen'
import KML from 'ol/format/KML'
import GeoJSON from 'ol/format/GeoJSON'
import Select from 'ol/interaction/Select'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import {
  Fill,
  Stroke,
  Style,
} from 'ol/style'
import {
  altKeyOnly,
  click,
  pointerMove,
} from 'ol/events/condition'
import {
  fromLonLat,
  toLonLat,
  useGeographic,
  transform,
} from 'ol/proj'

useGeographic()

const vectorStyle = new Style({
  fill: new Fill({
    color: [0xff, 0xff, 0x33, 0.001],
  }),
  stroke: new Stroke({
    color: '#99bbff',
  }),
})

const vector = new VectorLayer({
  source: new VectorSource({
    url: 'data/kml/timezones.kml',
    format: new KML({
      extractStyles: false,
    }),
  }),
  style: vectorStyle,
})

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new XYZ({
        url: 'http://{1-4}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      })
    }),
    vector,
  ],
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
})

// https://gis.stackexchange.com/questions/16906/how-do-i-get-the-coordinates-of-a-click-on-vector-feature-layer-in-openlayers2
map.on('click', async function(event) {
  // console.log(transform(event.coordinate, 'EPSG:3857', 'EPSG:4326'))
  const coords = event.coordinate
  var placeInfo = await reverseGeocode(coords)
  
  document.getElementById('longitude').value = coords[0]
  document.getElementById('latitude').value = coords[1]
  document.getElementById('display_name').rows = placeInfo.display_name && (placeInfo.display_name.match(/,\s/g) || []).length + 3 || 3
  document.getElementById('display_name').value = placeInfo.display_name && placeInfo.display_name.replaceAll(', ', ',\n') || 'Unknown location' + '\n' + 'Or you are in the middle of the ocean' 
  console.log(placeInfo)
})

// https://stackoverflow.com/questions/50882125/open-layers-maps-with-longitude-and-latitude-get-address
async function reverseGeocode(coords) {
  return await fetch('http://nominatim.openstreetmap.org/reverse?format=json&lon=' + coords[0] + '&lat=' + coords[1])
    .then(function(response) {
      return response.json()
    })
}
