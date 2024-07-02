import { MapynaGoogleMapControllers } from "./GoogleMap/GoogleMapControllers"
import { MapynaMap } from "./Classes/Map"
import { MapynaGoogleMapMarker } from "./GoogleMap/GoogleMapMarker"
import { MapynaGoogleMapInfoWindow } from "./GoogleMap/GoogleMapInfoWindow"
import { MapynaGoogleMapLayers } from "./GoogleMap/GoogleMapLayers"
import type { TMapynaConfig } from "./types/config.type"

type TOptions = {
  scrollwheel: boolean
  zoomControl: boolean
  mapTypeControlOptions: {
    mapTypeIds: string[]
  }
  streetViewControl: boolean
  fullscreenControl: boolean
  clickableIcons: boolean
  mapId: string | null
  center?: google.maps.LatLng
  zoom?: number
  mapTypeId?: string
}

export class MapynaGoogleMap extends MapynaMap {
  mapOverlay: google.maps.OverlayView | null
  advancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement | null

  constructor(params: TMapynaConfig) {
    super(params)
    this.mapOverlay = null
    this.advancedMarkerElement = null
  }

  async initMap() {
    const options: TOptions = {
      scrollwheel: this.config.scrollWheel,
      zoomControl: false,
      mapTypeControlOptions: {
        mapTypeIds: [] // Remove all map types except the default (roadmap)
      },
      fullscreenControl: false,
      streetViewControl: false,
      clickableIcons: false,
      mapId: this.config.gMapId
    }

    if (this.config.defaultView === "satellite") {
      options.mapTypeId = google.maps.MapTypeId.SATELLITE
    }

    if (this.config.defaultCenter) {
      options.center = this.config.defaultCenter as google.maps.LatLng
      options.zoom = this.config.defaultZoom || 12
    }

    this.map = new google.maps.Map(this.$map, options)

    // Import advanced Marker Library

    const MarkerLibrary = await google.maps.importLibrary("marker")
    const { AdvancedMarkerElement } = MarkerLibrary as google.maps.MarkerLibrary
    this.advancedMarkerElement = AdvancedMarkerElement

    this.mapOverlay = new google.maps.OverlayView()
    this.mapOverlay.draw = () => {}
    this.mapOverlay.setMap(this.map)

    this.addDependencies().then(async () => {
      if (this.map instanceof google.maps.Map) {
        this.map.addListener("idle", () => {
          this.handleViewUpdate.call(this)
        })
      }

      if (this.data) {
        this.dataSetup()
      } else {
        this.handleViewUpdate.call(this)
      }
    })
  }

  async addDependencies() {
    await super.addDependencies()

    if (this.config.infoWindow.enabled) {
      this.infoWindow = new MapynaGoogleMapInfoWindow(this)
    }

    if (this.config.controllers) {
      this.controllers = new MapynaGoogleMapControllers(this)
    }

    this.markerObject = new MapynaGoogleMapMarker(this)
    await this.markerObject.init()
  }

  async dataSetup() {
    this.clearData()

    const bounds = this.fitBoundsEnabled ? new google.maps.LatLngBounds() : null

    if (Array.isArray(this.data)) {
      await Promise.all(
        this.data.map(async (pointData: Record<string, any>) => {
          const lat = Number.parseFloat(pointData[this.config.latitudeKey])
          const lng = Number.parseFloat(pointData[this.config.longitudeKey])

          this.markerObject?.add(pointData)

          if (bounds) {
            const position = new google.maps.LatLng(lat, lng)
            bounds.extend(position)
          }
        })
      )
    }

    if (bounds && this.map && this.map instanceof google.maps.Map) {
      this.map.fitBounds(bounds)
    }

    this.markerObject?.checkClustering()
  }

  enableMap() {
    if (this.map instanceof google.maps.Map) {
      this.map.setOptions({
        draggable: true,
        draggableCursor: null,
        scrollwheel: this.config.scrollWheel,
        disableDoubleClickZoom: true
      })
    }
  }

  disableMap() {
    if (this.map instanceof google.maps.Map) {
      this.map.setOptions({
        draggable: false,
        scrollwheel: false,
        disableDoubleClickZoom: false
      })
    }
  }

  enableDragging() {
    if (this.map instanceof google.maps.Map) {
      this.map.setOptions({ draggable: true })
    }
  }

  disableDragging() {
    if (this.map instanceof google.maps.Map) {
      this.map.setOptions({ draggable: false })
    }
  }

  defineBounds() {
    return new google.maps.LatLngBounds()
  }

  fitBounds(bounds: google.maps.LatLngBounds) {
    if (this.map instanceof google.maps.Map) {
      return this.map?.fitBounds(bounds)
    }
  }

  zoom() {
    return this.map?.getZoom()
  }

  project(point: [number, number], zoom: number) {
    if (
      !this.map ||
      (this.map instanceof google.maps.Map && !this.map.getProjection())
    ) {
      return null
    }

    const latLng = new google.maps.LatLng(point[0], point[1])

    let googleY = null
    let googleX = null

    if (this.map instanceof google.maps.Map && this.map.getProjection()) {
      const projection = this.map.getProjection()
      const googlePoint = projection?.fromLatLngToPoint(latLng)
      const scale = 2 ** zoom
      if (googlePoint) {
        googleX = googlePoint.x * scale
        googleY = googlePoint.y * scale
      }
    }
    if (googleX && googleY) {
      return new google.maps.Point(googleX, googleY)
    }
  }

  getMarkerPixelPosition(marker: google.maps.marker.AdvancedMarkerElement) {
    const projection = this.mapOverlay?.getProjection()
    return projection?.fromLatLngToContainerPixel(
      marker.position as google.maps.LatLng
    )
  }

  getBoundsObject() {
    const bounds = this.map?.getBounds() as google.maps.LatLngBounds

    if (!bounds) {
      return null
    }

    const ne = bounds.getNorthEast()
    const sw = bounds.getSouthWest()

    return {
      northWest: { lat: ne.lat(), lng: sw.lng() },
      northEast: { lat: ne.lat(), lng: ne.lng() },
      southEast: { lat: sw.lat(), lng: ne.lng() },
      southWest: { lat: sw.lat(), lng: sw.lng() }
    }
  }

  /**
   * Get layers object
   */
  getLayersObject() {
    return new MapynaGoogleMapLayers(this)
  }

  setupSatelliteView() {}
}
