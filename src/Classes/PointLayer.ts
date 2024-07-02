import { MapynaMarkerStyle } from "./MarkerStyle"
import { mergeDeep } from "../helpers"
import type { MapynaLeaflet } from "../MapynaLeaflet"
import type { MapynaGoogleMap } from "../MapynaGoogleMap"
import type {
  TMapynaLayer,
  TBoundingBox,
  TLayerCallbackResponse
} from "../types/config.type"
import type { MapynaGoogleMapInfoWindow } from "../GoogleMap/GoogleMapInfoWindow"
import type { MapynaLeafletInfoWindow } from "../Leaflet/LeafletInfoWindow"

export abstract class MapynaPointLayer {
  root: MapynaLeaflet | MapynaGoogleMap
  bounds: TBoundingBox
  data: any
  markers: any
  rfLayer: TMapynaLayer | null
  layer: TMapynaLayer
  infoWindow: MapynaGoogleMapInfoWindow | MapynaLeafletInfoWindow | null

  constructor(
    root: MapynaLeaflet | MapynaGoogleMap,
    {
      layer,
      bounds,
      data
    }: {
      layer: TMapynaLayer
      bounds: TBoundingBox
      data: TLayerCallbackResponse[]
    }
  ) {
    this.root = root
    this.bounds = bounds
    this.data = data
    this.markers = []
    this.rfLayer = null

    if (
      root.config.rfEnabled &&
      root.config.rfIntegration &&
      root.config.rfIntegration.layers &&
      layer.name in root.config.rfIntegration.layers
    ) {
      this.rfLayer = root.config.rfIntegration.layers[layer.name]
    }

    if (this.root.config.rfEnabled && this.rfLayer) {
      this.layer = mergeDeep(layer, this.rfLayer)
    } else {
      this.layer = layer
    }

    this.infoWindow = null
    if (this.layer.infoWindow) {
      this.infoWindow = this.getInfoWindowInstance()
    }

    this.load()
  }

  load(data: TLayerCallbackResponse[] | null = null) {
    if (data) {
      this.data = data
    }

    for (let i = 0; i < this.data.length; i++) {
      const pointData = this.data[i]
      this.addPoint(pointData)
    }
  }

  abstract getInfoWindowInstance():
    | MapynaGoogleMapInfoWindow
    | MapynaLeafletInfoWindow

  abstract addPoint(pointData: Record<string, any>): void

  addPointer(pointData: Record<string, any>) {
    let latKey, lngKey, idKey

    latKey = this.layer.latitudeKey
    lngKey = this.layer.longitudeKey
    //idKey = this.layer.idKey

    //const id = pointData[idKey];

    const position = {
      lat: parseFloat(pointData[latKey]),
      lng: parseFloat(pointData[lngKey])
    }

    const markerStyle = new MapynaMarkerStyle(
      this.root,
      pointData,
      this.layer.markerStyles
    )

    return { position, markerStyle }
  }

  removeAll() {
    for (let i = 0; i < this.markers.length; i++) {
      // Remove the marker from the map
      this.root.markerObject?.removeOne(this.markers[i])
    }

    this.markers = []
  }
}
