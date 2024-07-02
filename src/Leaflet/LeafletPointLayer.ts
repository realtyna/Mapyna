import { MapynaPointLayer } from "../Classes/PointLayer"
import type { MapynaLeaflet } from "../MapynaLeaflet"
import type {
  TMapynaLayer,
  TBoundingBox,
  TLayerCallbackResponse
} from "../types/config.type"
import { MapynaLeafletInfoWindow } from "./LeafletInfoWindow"

export class MapynaLeafletPointLayer extends MapynaPointLayer {
  constructor(
    root: MapynaLeaflet,
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
    return new MapynaLeafletInfoWindow(
      this.root as MapynaLeaflet,
      this.layer.infoWindow
    )
  }

  addPoint(pointData: Record<string, any>) {
    const { position, markerStyle } = super.addPointer(pointData)

    const icon = L.divIcon({
      className: "",
      html: markerStyle?.$element?.outerHTML
    })

    const marker = L.marker([position.lat, position.lng], { icon })

    if (this.infoWindow && this.infoWindow instanceof MapynaLeafletInfoWindow) {
      this.infoWindow.linkToPoint(marker, pointData)
      const self = this

      if (this.root.map instanceof L.Map) {
        this.root.map?.on("mousedown", function () {
          self.infoWindow?.hide.call(self.infoWindow)
        })
      }
    }

    marker.addTo(this.root.map as L.Map)

    this.markers.push(marker)
  }
}
