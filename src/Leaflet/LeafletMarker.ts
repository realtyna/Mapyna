import type { MarkerClusterGroup } from "leaflet"
import { MapynaMarker } from "../Classes/Marker"
import { MapynaMarkerStyle } from "../Classes/MarkerStyle"
import type { MapynaLeaflet } from "../MapynaLeaflet"

import { MapynaLeafletInfoWindow } from "./LeafletInfoWindow"

export class MapynaLeafletMarker extends MapynaMarker {
  root: MapynaLeaflet
  markerCluster: MarkerClusterGroup | null

  constructor(root: MapynaLeaflet) {
    super(root)

    this.root = root
    this.markerCluster = null
  }

  async init() {
    if (this.isClusteringEnabled()) {
      await this.clustererSetup()
    }
  }

  add(pointData: Record<string, any>) {
    const lat = pointData[this.root.config.latitudeKey]
    const lng = pointData[this.root.config.longitudeKey]

    const markerStyle = new MapynaMarkerStyle(this.root, pointData)

    const icon = L.divIcon({
      className: "",
      html: markerStyle.$element?.outerHTML
    })

    const marker = L.marker([lat, lng], { icon })

    if (this.root.infoWindow instanceof MapynaLeafletInfoWindow) {
      this.root.infoWindow?.linkToPoint(marker, pointData)
    }

    if (this.markerCluster) {
      // clustering is enabled
      this.markerCluster.addLayer(marker)
    } else {
      marker.addTo(this.root.map as L.Map)
    }

    const markersArr = this.markers

    markersArr.push(marker)
  }

  removeOne(marker: L.Marker) {
    if (this.root.map instanceof L.Map) {
      this.root.map?.removeLayer(marker)
    }
  }

  async clustererSetup() {
    await this.root.importScript(
      this.root.config.scripts.leafletMarkerClustererScriptSource
    )
    await this.root.importCSS(
      this.root.config.scripts.leafletMarkerClustererStyleSource
    )
    await this.root.importCSS(
      this.root.config.scripts.leafletMarkerClustererDefaultStyleSource
    )
  }

  checkClustering() {
    if (this.isClusteringEnabled()) {
      this.markerCluster = L.markerClusterGroup({
        ...this.root.config.clustering?.leafletOptions
      })
    }
  }

  clearClustering() {
    if (!this.markerCluster) return
    this.markerCluster.clearLayers()
  }
}
