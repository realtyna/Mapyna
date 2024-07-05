import type { MarkerClusterer } from "@googlemaps/markerclusterer"
import { MapynaMarker } from "../Classes/Marker"
import { MapynaMarkerStyle } from "../Classes/MarkerStyle"
import type { MapynaGoogleMap } from "../MapynaGoogleMap"
import { MapynaGoogleMapInfoWindow } from "./GoogleMapInfoWindow"

export class MapynaGoogleMapMarker extends MapynaMarker {
  root: MapynaGoogleMap
  markerCluster: MarkerClusterer | null
  oms: any

  constructor(root: MapynaGoogleMap) {
    super(root)

    this.root = root
    this.markerCluster = null
    this.oms = null
  }

  async init() {
    if (this.isClusteringEnabled()) {
      await this.clustererSetup()
    }

    await this.root.importScript(
      this.root.config.scripts.googleMapMarkerSpiderfierScriptSource
    )

    if (OverlappingMarkerSpiderfier) {
      this.oms = new OverlappingMarkerSpiderfier(
        this.root.map,
        this.root.config.spiderfy.options
      )
    }
  }

  async add(pointData: Record<string, any>) {
    const root = this.root
    const lat = Number.parseFloat(pointData[root.config.latitudeKey])
    const lng = Number.parseFloat(pointData[root.config.longitudeKey])

    const markerStyle = new MapynaMarkerStyle(this.root, pointData)
    const markerStyleSpiderfied = new MapynaMarkerStyle(
      this.root,
      pointData,
      null,
      true
    )

    if (this.root.advancedMarkerElement) {
      const marker = new this.root.advancedMarkerElement({
        map: root.map as google.maps.Map,
        position: new google.maps.LatLng(lat, lng),
        content: markerStyle?.$element,
        zIndex: 50000
      })

      if (this.root.infoWindow instanceof MapynaGoogleMapInfoWindow) {
        this.root.infoWindow?.linkToPoint(
          marker,
          pointData,
          this.isSpiderfierEnabled()
        )
      }

      google.maps.event.addListener(marker, "click", () => {})

      if (this.isSpiderfierEnabled() && this.oms) {
        var spiderfiedMarkers = this.oms.markersNearMarker(marker, false)

        // Format spiderfied markers
        google.maps.event.addListener(
          marker,
          "spider_format",
          (status: string) => {
            let spiderfiableIcon = document.createElement("span")

            const styles =
              spiderfiedMarkers.length > 7
                ? { bgColor: "#ef2f22" }
                : spiderfiedMarkers.length > 3
                  ? { bgColor: "#f7c134" }
                  : { bgColor: "#3b84fa" }

            spiderfiableIcon.setAttribute(
              "style",
              `line-height: 1;display: inline-block; background-color: ${styles.bgColor}; border-radius: 8px; padding: 4px; color: #fff; font-weight: bold; text-align: center; font-size: 14px;`
            )
            spiderfiableIcon.textContent = `${spiderfiedMarkers.length + 1} unit`

            var iconURL =
              status == OverlappingMarkerSpiderfier.markerStatus.SPIDERFIED
                ? markerStyleSpiderfied?.$element
                : status ==
                    OverlappingMarkerSpiderfier.markerStatus.SPIDERFIABLE
                  ? spiderfiableIcon
                  : status ==
                      OverlappingMarkerSpiderfier.markerStatus.UNSPIDERFIABLE
                    ? markerStyle?.$element
                    : status ==
                        OverlappingMarkerSpiderfier.markerStatus.UNSPIDERFIED
                      ? spiderfiableIcon
                      : markerStyle?.$element

            marker.content = iconURL
          }
        )

        this.oms.addMarker(marker)
      }

      this.markers.push(marker)
    }
  }

  removeOne(marker: google.maps.marker.AdvancedMarkerElement) {
    marker.map = null
  }

  async clustererSetup() {
    await this.root.importScript(
      this.root.config.scripts.googleMapMarkerClustererScriptSource
    )
  }

  checkClustering() {
    if (this.root.config.clustering?.enabled) {
      // @ts-ignore
      this.markerCluster = new markerClusterer.MarkerClusterer({
        markers: this.markers,
        map: this.root.map,
        ...this.root.config.clustering?.googleMapOptions
      })
    }
  }

  clearClustering() {
    this.markerCluster?.clearMarkers()
  }
}
