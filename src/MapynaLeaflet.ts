import { type LatLngExpression } from "leaflet"
import { MapynaLeafletControllers } from "./Leaflet/LeafletControllers"
import { MapynaMap } from "./Classes/Map"
import { MapynaLeafletMarker } from "./Leaflet/LeafletMarker"
import { MapynaLeafletInfoWindow } from "./Leaflet/LeafletInfoWindow"
import { MapynaLeafletLayers } from "./Leaflet/LeafletLayers"
import type { TMapynaConfig } from "./types/config.type"

type TOptions = {
  scrollWheelZoom?: boolean
  center?: LatLngExpression
  zoom?: number
}

export class MapynaLeaflet extends MapynaMap {
  satelliteLayer: L.TileLayer | null
  roadmapLayer: L.TileLayer | null

  constructor(params: TMapynaConfig) {
    super(params)
    this.satelliteLayer = null
    this.roadmapLayer = null
  }

  initMap() {
    const options: TOptions = {
      scrollWheelZoom: this.config.scrollWheel
    }

    if (this.config.defaultCenter) {
      options.center = [
        this.config.defaultCenter.lat,
        this.config.defaultCenter.lng
      ] as LatLngExpression
      options.zoom = this.config.defaultZoom || 12
    }

    this.map = L.map(this.$map, options) as L.Map

    this.roadmapLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      }
    )

    if (this.config.defaultView === "satellite") {
      this.setupSatelliteView()
      this.satelliteLayer?.addTo(this.map)
    } else {
      this.roadmapLayer.addTo(this.map)
    }

    var zoomControl = this.map.zoomControl

    // Remove the zoom control from the map
    this.map.removeControl(zoomControl)

    const self = this
    this.map.on("mousedown", function () {
      if (self.infoWindow) {
        self.infoWindow.hide.call(self.infoWindow)
      }
    })

    this.addDependencies().then(() => {
      if (self.map instanceof L.Map) {
        self.map.on("moveend", () => self.handleViewUpdate.call(self))
      }

      if (this.data) {
        self.dataSetup()
      } else {
        self.handleViewUpdate.call(self)
      }
    })
  }

  async addDependencies() {
    await super.addDependencies()

    if (this.config.infoWindow.enabled) {
      this.infoWindow = new MapynaLeafletInfoWindow(this)
    }

    if (this.config.controllers) {
      this.controllers = new MapynaLeafletControllers(this)
    }

    this.markerObject = new MapynaLeafletMarker(this)
    await this.markerObject.init()
  }

  dataSetup() {
    this.clearData()

    const bounds = this.fitBoundsEnabled ? L.latLngBounds([0, 0], [0, 0]) : null

    this.markerObject?.checkClustering()

    // Loop through each point in the 'data' array
    if (this.data && this.data.length > 0 && Array.isArray(this.data)) {
      for (let i = 0; i < this.data.length; i++) {
        const pointData = this.data[i]
        const lat = pointData[this.config.latitudeKey]
        const lng = pointData[this.config.longitudeKey]

        this.markerObject?.add(pointData)

        if (bounds) {
          bounds.extend(L.latLng(lat, lng))
        }
      }
    }

    if (this.markerObject?.markerCluster && this.map instanceof L.Map) {
      this.map?.addLayer(this.markerObject.markerCluster as L.LayerGroup)
    }

    // Fit the map to the bounds
    if (bounds && this.map instanceof L.Map) {
      this.map?.fitBounds(bounds)
    }
  }

  enableMap() {
    if (this.map instanceof L.Map) {
      this.map.dragging.enable()

      if (this.config.scrollWheel) {
        this.map.scrollWheelZoom.enable()
      }
    }
  }

  disableMap() {
    // Assuming you have an equivalent method to disable map interactivity
  }

  enableDragging() {
    if (this.map instanceof L.Map) {
      this.map.dragging.enable()
    }
  }

  disableDragging() {
    if (this.map instanceof L.Map) {
      this.map?.dragging.disable()
    }
  }

  defineBounds() {
    return L.latLngBounds([])
  }

  fitBounds(bounds: L.LatLngBounds) {
    if (this.map instanceof L.Map) {
      return this.map?.fitBounds(bounds)
    }
  }

  zoom() {
    return this.map?.getZoom()
  }

  project(point: [number, number], zoom: number) {
    if (this.map instanceof L.Map) {
      return this.map?.project(point, zoom)
    }
  }

  getMarkerPixelPosition(marker: L.Marker) {
    const latLng = marker.getLatLng()
    if (this.map instanceof L.Map) {
      return this.map?.latLngToContainerPoint(latLng)
    }
  }

  getBoundsObject() {
    if (!this.data && !this.config.defaultCenter) {
      return null
    }

    const bounds = this.map?.getBounds() as L.LatLngBounds
    const ne = bounds?.getNorthEast()
    const sw = bounds?.getSouthWest()

    if (!ne || !sw) {
      return null
    }
    return {
      northWest: { lat: ne.lat, lng: sw.lng },
      northEast: { lat: ne.lat, lng: ne.lng },
      southEast: { lat: sw.lat, lng: ne.lng },
      southWest: { lat: sw.lat, lng: sw.lng }
    }
  }

  getLayersObject() {
    return new MapynaLeafletLayers(this)
  }

  setupSatelliteView() {
    this.satelliteLayer = L.tileLayer(
      "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"]
      }
    )
  }
}
