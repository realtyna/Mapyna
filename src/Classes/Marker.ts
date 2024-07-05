import type { MapynaGoogleMap } from "../MapynaGoogleMap"
import type { MapynaLeaflet } from "../MapynaLeaflet"
import type * as L from "leaflet"

export abstract class MapynaMarker {
  root: MapynaGoogleMap | MapynaLeaflet
  markers: (google.maps.marker.AdvancedMarkerElement | L.Marker)[]

  constructor(root: MapynaGoogleMap | MapynaLeaflet) {
    this.root = root
    this.markers = []
  }

  removeAll() {
    for (let i = 0; i < this.markers.length; i++) {
      this.removeOne(this.markers[i])
    }

    this.markers = []
  }

  abstract removeOne(
    marker: google.maps.marker.AdvancedMarkerElement | L.Marker
  ): void

  isClusteringEnabled() {
    return this.root.config.clustering?.enabled
  }

  isSpiderfierEnabled() {
    const zoom = this.root.zoom()

    const minZoom = this.root.config.spiderfy.zoom || 0

    if (this.root.config.spiderfy.enabled && zoom && zoom > minZoom) {
      return true
    } else {
      return false
    }
  }
}
