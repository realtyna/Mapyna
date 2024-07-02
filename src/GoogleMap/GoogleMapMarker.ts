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
      this.oms = new OverlappingMarkerSpiderfier(this.root.map, {
        markersWontMove: true,
        markersWontHide: true,
        keepSpiderfied: true,
        spiralFootSeparation: 60,
        spiralLengthFactor: 20,
        circleFootSeparation: 100,
        nearbyDistance: 10
      })
    }
  }

  async add(pointData: Record<string, any>) {
    const root = this.root
    const lat = Number.parseFloat(pointData[root.config.latitudeKey])
    const lng = Number.parseFloat(pointData[root.config.longitudeKey])

    const markerStyle = new MapynaMarkerStyle(this.root, pointData)

    if (this.root.advancedMarkerElement) {
      const marker = new this.root.advancedMarkerElement({
        map: root.map as google.maps.Map,
        position: new google.maps.LatLng(lat, lng),
        content: markerStyle?.$element,
        zIndex: 50000
      })

      if (this.root.infoWindow instanceof MapynaGoogleMapInfoWindow) {
        this.root.infoWindow?.linkToPoint(marker, pointData)
      }

      const zoom = this.root.map?.getZoom()

      if (zoom && zoom > 15) {
        google.maps.event.addListener(
          marker,
          "spider_format",
          (status: string) => {
            let spiderfiableIcon = document.createElement("span")

            var spiderfiedMarkers = this.oms.markersNearMarker(marker, false)

            const styles =
              spiderfiedMarkers.length > 7
                ? { bgColor: "#ef2f22", borderColor: "#ae3225" }
                : spiderfiedMarkers.length > 3
                  ? { bgColor: "#f7c134", borderColor: "#bd9b39" }
                  : { bgColor: "#3b84fa", borderColor: "#3e62c2" }

            spiderfiableIcon.setAttribute(
              "style",
              `line-height: 1;display: inline-block;border : 1px solid;border-color: ${styles.borderColor}; background-color: ${styles.bgColor}; border-radius: 50%; padding: 4px; color: #000; font-weight: bold;aspect-ratio: square; text-align: center; font-size: 14px;`
            )
            spiderfiableIcon.innerHTML = spiderfiedMarkers.length + 1

            var iconURL =
              status == OverlappingMarkerSpiderfier.markerStatus.SPIDERFIED
                ? markerStyle?.$element
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
      }

      this.oms.addMarker(marker)

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
