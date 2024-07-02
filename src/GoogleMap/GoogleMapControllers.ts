import { MapynaControllers } from "../Classes/Controllers"
import type { MapynaGoogleMap } from "../MapynaGoogleMap"
import { MapynaGoogleMapDrawing } from "./GoogleMapDrawing"

export class MapynaGoogleMapControllers extends MapynaControllers {
  constructor(root: MapynaGoogleMap) {
    super(root)
  }

  handleZoomInClick() {
    const zoom = this.root.map?.getZoom()
    if (zoom) {
      this.root.map?.setZoom(zoom + 1)
    }
  }

  handleZoomOutClick() {
    const zoom = this.root.map?.getZoom()

    if (zoom) {
      this.root.map?.setZoom(zoom - 1)
    }
  }

  setDrawingInstance() {
    this.drawing = new MapynaGoogleMapDrawing(
      this.root as MapynaGoogleMap,
      this
    )
  }

  handleViewClick() {
    super.handleViewClick()

    const type =
      this.root.mapView === "satellite"
        ? google.maps.MapTypeId.SATELLITE
        : google.maps.MapTypeId.ROADMAP
    if (this.root.map instanceof google.maps.Map) {
      this.root.map.setMapTypeId(type)
    }
  }
}
