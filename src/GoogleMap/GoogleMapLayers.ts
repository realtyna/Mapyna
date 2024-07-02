import { MapynaLayers } from "../Classes/Layers"
import { MapynaGoogleMapZoneLayer } from "./GoogleMapZoneLayer"
import { MapynaGoogleMapPointLayer } from "./GoogleMapPointLayer"
import type { MapynaGoogleMap } from "../MapynaGoogleMap"
import type {
  TBoundingBox,
  TLayerCallbackResponse,
  TMapynaLayer
} from "../types/config.type"

export class MapynaGoogleMapLayers extends MapynaLayers {
  constructor(root: MapynaGoogleMap) {
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
          this.layers[layerName] = new MapynaGoogleMapZoneLayer(
            this.root as MapynaGoogleMap,
            params
          )
        } else if (params.layer.type === "point") {
          this.layers[layerName] = new MapynaGoogleMapPointLayer(
            this.root as MapynaGoogleMap,
            params
          )
        }
      }
    )
  }

  async extend(
    layerName: string,
    bounds: {
      northWest: { lat: number; lng: number }
      southEast: { lat: number; lng: number }
    }
  ) {
    const northWest = new google.maps.LatLng(
      bounds.northWest.lat,
      bounds.northWest.lng
    )
    const southEast = new google.maps.LatLng(
      bounds.southEast.lat,
      bounds.southEast.lng
    )

    /*const newBounds = new google.maps.LatLngBounds(
            { lat: bounds.northWest.lat, lng: bounds.northWest.lng },
            { lat: bounds.southEast.lat, lng: bounds.southEast.lng }
        );*/

    const isInside =
      this.bounds[layerName].contains(northWest) &&
      this.bounds[layerName].contains(southEast)

    if (!isInside) {
      // this.bounds[layerName].union(this.bounds[layerName], newBounds); // TODO -> Check if union is a better approach
      this.bounds[layerName].extend(northWest)
      this.bounds[layerName].extend(southEast)
      return true
    }

    return false
  }
}
