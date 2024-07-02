import { MapynaLayers } from "../Classes/Layers"
import { MapynaLeafletZoneLayer } from "./LeafletZones"
import { MapynaLeafletPointLayer } from "./LeafletPointLayer"

import type { MapynaLeaflet } from "../MapynaLeaflet"
import type {
  TBoundingBox,
  TLayerCallbackResponse,
  TMapynaLayer
} from "../types/config.type"

export class MapynaLeafletLayers extends MapynaLayers {
  constructor(root: MapynaLeaflet) {
    super(root)
  }

  async loadLayer(layerName: string, newBounds: TBoundingBox) {
    return await super.loadLayer(
      layerName,
      newBounds,
      (params: {
        layer: TMapynaLayer
        bounds: TBoundingBox
        data: TLayerCallbackResponse[]
      }) => {
        if (params.layer.type === "zone") {
          this.layers[layerName] = new MapynaLeafletZoneLayer(
            this.root as MapynaLeaflet,
            params
          )
        } else if (params.layer.type === "point") {
          this.layers[layerName] = new MapynaLeafletPointLayer(
            this.root as MapynaLeaflet,
            params
          )
        }
      }
    )
  }

  async extend(
    layerName: string,
    bounds: {
      southWest: { lat: number; lng: number }
      northEast: { lat: number; lng: number }
    }
  ) {
    const southWest = L.latLng(bounds.southWest.lat, bounds.southWest.lng)
    const northEast = L.latLng(bounds.northEast.lat, bounds.northEast.lng)

    const isEmpty = !this.bounds[layerName].isValid()

    if (isEmpty) {
      this.bounds[layerName].extend(southWest)
      this.bounds[layerName].extend(northEast)
      return true
    }

    const isInside =
      this.bounds[layerName].contains(southWest) &&
      this.bounds[layerName].contains(northEast)

    if (!isInside) {
      this.bounds[layerName].extend(southWest)
      this.bounds[layerName].extend(northEast)
      return true
    }

    return false
  }
}
