import { MapynaControllers } from "../Classes/Controllers"
import { MapynaLeaflet } from "../MapynaLeaflet"
import { MapynaLeafletDrawing } from "./LeafletDrawing"

export class MapynaLeafletControllers extends MapynaControllers {
  constructor(root: MapynaLeaflet) {
    super(root)

    // Define the satellite tile layers if view controller exists
    if (root.config.controllers && "view" in root.config.controllers) {
      this.root.setupSatelliteView()
    }
  }

  handleZoomInClick() {
    this.root.map?.setZoom(this.root.map.getZoom()! + 1)
  }

  handleZoomOutClick() {
    this.root.map?.setZoom(this.root.map.getZoom()! - 1)
  }

  setDrawingInstance() {
    this.drawing = new MapynaLeafletDrawing(this.root as MapynaLeaflet, this)
  }

  handleViewClick() {
    super.handleViewClick()
    if (this.root instanceof MapynaLeaflet) {
      if (this.root.mapView === "satellite") {
        if (this.root.map instanceof L.Map && this.root.roadmapLayer) {
          this.root.map?.removeLayer(this.root.roadmapLayer)
        }
        this.root.satelliteLayer?.addTo(this.root.map as L.Map)
      } else {
        if (this.root.map instanceof L.Map && this.root.satelliteLayer) {
          this.root.map?.removeLayer(this.root.satelliteLayer)
        }
        this.root.roadmapLayer?.addTo(this.root.map as L.Map)
      }
    }
  }
}
