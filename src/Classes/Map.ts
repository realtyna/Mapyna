import config from "../config"
import { MapynaNotify } from "./Notify"
import eventEmitter from "./EventEmitter"
import { MapynaRealtyFeedIntegration } from "./RealtyFeedIntegration"
import { mergeDeep } from "../helpers"
import type { TMapynaBaseConfig, TMapynaConfig } from "../types/config.type"
import type { MapynaControllers } from "./Controllers"
import type { MapynaGoogleMapMarker } from "../GoogleMap/GoogleMapMarker"
import type { MapynaLeafletMarker } from "../Leaflet/LeafletMarker"
import type { MapynaLeafletLayers } from "../Leaflet/LeafletLayers"
import type { MapynaGoogleMapLayers } from "../GoogleMap/GoogleMapLayers"
import type { MapynaGoogleMapInfoWindow } from "../GoogleMap/GoogleMapInfoWindow"
import type { MapynaLeafletInfoWindow } from "../Leaflet/LeafletInfoWindow"

interface IPosition {
  [key: string]: unknown
  TOP: string
  RIGHT: string
  BOTTOM: string
  LEFT: string
}

interface IPositionCodes {
  [key: string]: number
  TOP_RIGHT: number
  TOP_LEFT: number
  BOTTOM_RIGHT: number
  BOTTOM_LEFT: number
  RIGHT_TOP: number
  RIGHT_BOTTOM: number
  LEFT_TOP: number
  LEFT_BOTTOM: number
}

export class MapynaMap<T extends google.maps.Map | L.Map> {
  map: T | null
  config: TMapynaBaseConfig
  data: Record<string, any>[] | Record<string, any> | null
  mapView: "map" | "satellite"
  markerObject: MapynaGoogleMapMarker | MapynaLeafletMarker | null
  controllers: MapynaControllers | null
  $container: HTMLDivElement
  $map: HTMLDivElement
  $loading: HTMLElement | null
  loadingStack: number
  mapLoaded: boolean
  drawingJustDone: boolean
  drawingEnabled: boolean
  fitBoundsEnabled: boolean
  positionCodes: IPositionCodes
  layersObject: MapynaLeafletLayers | MapynaGoogleMapLayers | null
  notify: MapynaNotify | null
  rf: MapynaRealtyFeedIntegration | null
  infoWindow: MapynaGoogleMapInfoWindow | MapynaLeafletInfoWindow | null
  payload: Record<string, any> | null
  fetchControllers: {
    [key: string]: AbortController
  }
  fetchTimeouts: {
    [key: string]: ReturnType<typeof setTimeout>
  }
  fetchDelay: number
  mapSize: { width: number | null; height: number | null }

  constructor(params: TMapynaConfig) {
    this.map = null

    this.data = params.data ?? null
    delete params.data

    this.config = mergeDeep(config.defaults, params)

    this.positionCodes = {
      TOP_RIGHT: 0,
      TOP_LEFT: 0,
      BOTTOM_RIGHT: 0,
      BOTTOM_LEFT: 0,
      RIGHT_TOP: 0,
      RIGHT_BOTTOM: 0,
      LEFT_TOP: 0,
      LEFT_BOTTOM: 0
    }

    const { $container, $map } = this.createMapElement()

    this.$container = $container
    this.$map = $map

    this.mapView = this.config.defaultView || "map"

    this.markerObject = null

    this.controllers = null

    this.$loading = null
    this.loadingStack = 0

    this.mapLoaded = false
    this.drawingJustDone = false
    this.drawingEnabled = false
    this.fitBoundsEnabled = true

    this.layersObject = this.getLayersObject()
    this.notify = null

    this.rf = null
    if (this.config.rfEnabled) {
      this.rf = new MapynaRealtyFeedIntegration(this)
    }

    this.infoWindow = null

    this.payload = null
    if (this.config.drawing.payload) {
      this.payload = this.config.drawing.payload
    }

    this.fetchControllers = {}
    this.fetchTimeouts = {}
    this.fetchDelay = 500
    this.mapSize = {
      width: this.$map.clientWidth,
      height: this.$map.clientHeight
    }
  }

  on(eventName: string, handler: (...args: any[]) => void) {
    eventEmitter.on(eventName, handler)
  }

  off(eventName: string, handler: (...args: any[]) => void) {
    eventEmitter.off(eventName, handler)
  }

  init() {
    this.initMap()
  }

  initMap() {}
  dataSetup() {}

  clearData() {
    if (this.markerObject) {
      this.markerObject.removeAll()

      if (this.markerObject.markerCluster) {
        this.markerObject.clearClustering()
      }
    }
  }

  updateData(data: any, options = {}) {
    if (!data) {
      return
    }
    this.data = data
    this.dataSetup()
  }

  /**
   * Creates the map element and returns the container and map
   */
  createMapElement() {
    const $entryDiv = document.getElementById(this.config.elementId)

    // Create Map Container
    const $mapContainer = document.createElement("div")
    $mapContainer.setAttribute("id", "mapyna-container")
    $mapContainer.style.display = "flex"
    $mapContainer.style.flexDirection = "column"
    $mapContainer.style.height = "100vh"
    $mapContainer.style.height = "100%"
    $mapContainer.style.position = "relative"
    $entryDiv?.appendChild($mapContainer)

    // Create Main Map Div Element
    const $mapDev = document.createElement("div")
    $mapDev.setAttribute("id", "mapyna-map")
    $mapDev.style.flex = "1"
    $mapContainer.appendChild($mapDev)

    return {
      $container: $mapContainer,
      $map: $mapDev
    }
  }

  setElementPosition($el: HTMLElement, code: string, space = 5) {
    const position: IPosition = {
      TOP: "auto",
      RIGHT: "auto",
      BOTTOM: "auto",
      LEFT: "auto"
    }

    if (!code.includes("_")) {
      return position
    }

    code = code.toUpperCase()

    const [first, second] = code.split("_")

    $el.style.position = "absolute"
    $el.style.zIndex = "500"

    const firstPaddingCode: string = `padding${first.charAt(0)}${first.slice(1).toLowerCase()}`
    const secondPaddingCode: string = `padding${second.charAt(0)}${second.slice(1).toLowerCase()}`

    $el.style[firstPaddingCode as any] = space + "px"
    $el.style[secondPaddingCode as any] = space + "px"

    position[first] = 0

    const firstPosition = ["TOP", "BOTTOM"].includes(first)
      ? $el.offsetHeight
      : $el.offsetWidth
    this.positionCodes[first + "_" + second] = Math.max(
      this.positionCodes[first + "_" + second],
      firstPosition
    )

    if (second !== "CENTER") {
      position[second] = this.positionCodes[`${second}_${first}`]
      const secondPosition = ["TOP", "BOTTOM"].includes(second)
        ? $el.offsetHeight
        : $el.offsetWidth
      this.positionCodes[`${second}_${first}`] =
        this.positionCodes[`${second}_${first}`] + secondPosition
    }

    $el.style.top = position.TOP === "auto" ? position.TOP : `${position.TOP}px`
    $el.style.bottom =
      position.BOTTOM === "auto" ? position.BOTTOM : `${position.BOTTOM}px`
    $el.style.right =
      position.RIGHT === "auto" ? position.RIGHT : `${position.RIGHT}px`
    $el.style.left =
      position.LEFT === "auto" ? position.LEFT : `${position.LEFT}px`

    if (second === "CENTER") {
      if (["TOP", "BOTTOM"].includes(first)) {
        $el.style.left = "50%"
        $el.style.transform = "translateX(-50%)"
      } else {
        $el.style.top = "50%"
        $el.style.transform = "translateY(-50%)"
      }
    }
  }

  async addDependencies() {
    if (this.config.notify) {
      this.notify = new MapynaNotify(this)
    }
  }

  importScript(url: string) {
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement("script")
      script.src = url || ""
      script.onload = () => resolve()
      script.onerror = (err) => {
        console.log(err)
        reject(new Error(`Failed to load script: ${url}`))
      }
      document.head.appendChild(script)
    })
  }

  importCSS(url: string) {
    return new Promise<void>((resolve, reject) => {
      const link = document.createElement("link")
      link.href = url
      link.rel = "stylesheet"
      link.type = "text/css"

      link.onload = () => {
        resolve()
      }

      link.onerror = () => {
        reject(new Error(`Failed to load CSS file: ${url}`))
      }

      const head = document.getElementsByTagName("head")[0]
      head.appendChild(link)
    })
  }

  /**
   * Checks if the size of the map has changed.
   *
   * @returns {boolean} True if the size has changed, false otherwise.
   */
  checkMapSizeChanged = (): boolean => {
    // Get the new width and height of the map
    const newWidth = this.$map.clientWidth
    const newHeight = this.$map.clientHeight

    // If the width or height has changed, update the values and return true
    if (newWidth !== this.mapSize.width || newHeight !== this.mapSize.height) {
      this.mapSize.width = newWidth
      this.mapSize.height = newHeight
      return true
    }

    // If neither the width nor the height has changed, return false
    return false
  }

  setDrawingJustDone(payload: boolean) {
    this.drawingJustDone = payload
  }

  enableFitBounds(payload: boolean) {
    this.fitBoundsEnabled = payload
  }

  handleViewUpdate() {
    if (this.checkMapSizeChanged()) {
      return
    }

    if (this.infoWindow?.infoWindowIsShown) {
      this.infoWindow.hide.call(this.infoWindow)
    }

    if (!this.data) {
      if (this.config.defaultCenter) {
        this.enableFitBounds(false)
        this.mapLoaded = true
      }
    } else {
      if (!this.mapLoaded) {
        this.mapLoaded = true
        this.enableFitBounds(false)
        return false
      }

      if (this.infoWindow?.infoWindowIsShown) {
        this.infoWindow.hide()
      }
    }

    this.setPayload({
      type: "bounds",
      geometry: this.getBoundsObject()
    })

    this.emitUpdate()

    eventEmitter.emit("viewUpdated", this.getBoundsObject())
  }

  showLoading() {
    if (!this.config.loading) {
      return
    }

    if (!this.$loading) {
      this.$loading = document.createElement("div")
      this.$loading.classList.add(this.config.loading.className)
      this.setElementPosition(
        this.$loading,
        this.config.loading.position,
        this.config.loading.space
      )

      this.$container.appendChild(this.$loading)
    }

    this.$loading.style.display = "block"

    if (this.$loading) {
      this.$loading.style.display = "block"
    }
  }

  hideLoading() {
    if (this.$loading) {
      this.$loading.style.display = "none"
    }
  }

  setPayload(payload: Record<string, any> | null) {
    this.payload = payload
  }

  emitUpdate() {
    if (this.payload) {
      eventEmitter.emit("update", this.payload)
    } else {
      eventEmitter.emit("update", {
        type: "bounds",
        geometry: this.getBoundsObject()
      })
    }
  }

  getLayersObject(): MapynaLeafletLayers | MapynaGoogleMapLayers {
    throw new Error("Method not implemented.")
  }

  getBoundsObject() {}

  async fetch(
    controllerName: string,
    url: string,
    params: Record<string, any> = {}
  ) {
    const controller = this.fetchControllers[controllerName]
    if (controller) {
      controller.abort()
      delete this.fetchControllers[controllerName]
    }

    const abortController = new AbortController()

    const promise = fetch(url, {
      ...params,
      signal: abortController.signal
    })
      .then((response) => {
        this.hideLoading()

        return response.json()
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return null
        } else {
          this.hideLoading()
        }

        return error
      })

    this.fetchControllers[controllerName] = abortController
    this.showLoading()

    return promise
  }
}
