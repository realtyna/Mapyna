import { MapynaPointLayer } from "../Classes/PointLayer"
import { MapynaGoogleMap } from "../MapynaGoogleMap"
import type {
  TBoundingBox,
  TLayerCallbackResponse,
  TMapynaLayer
} from "../types/config.type"
import { MapynaGoogleMapInfoWindow } from "./GoogleMapInfoWindow"

export class MapynaGoogleMapPointLayer extends MapynaPointLayer {
  constructor(
    root: MapynaGoogleMap,
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
    super(root, { layer, bounds, data })
  }

  getInfoWindowInstance() {
    return new MapynaGoogleMapInfoWindow(
      this.root as MapynaGoogleMap,
      this.layer.infoWindow
    )
  }

  async addPoint(pointData: Record<string, any>) {
    const { position, markerStyle } = super.addPointer(pointData)

    if (
      this.infoWindow &&
      this.infoWindow instanceof MapynaGoogleMapInfoWindow &&
      markerStyle &&
      markerStyle.$element
    ) {
      if (this.root.map && this.root.map instanceof google.maps.Map) {
        this.root.map.addListener("mousedown", () => {
          this.infoWindow?.hide.call(this.infoWindow)
        })
      }

      if (this.root instanceof MapynaGoogleMap) {
        if (this.root.advancedMarkerElement) {
          const marker = new this.root.advancedMarkerElement({
            map: this.root.map as google.maps.Map,
            position: position,
            content: markerStyle.$element,
            zIndex: 50000
          })

          google.maps.event.addListener(marker, "click", () => {})

          this.infoWindow.linkToPoint(marker, pointData, false, "click")

          this.markers.push(marker)
        }
      }
    }
  }
}
