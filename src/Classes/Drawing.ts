/* eslint-disable no-unused-vars */
import config from "../config"
import eventEmitter from "./EventEmitter"
import { GDouglasPeucker } from "../helpers"
import type { LatLngLiteral, LeafletMouseEvent } from "leaflet"
import type { MapynaLeaflet } from "../MapynaLeaflet"
import type { MapynaGoogleMap } from "../MapynaGoogleMap"
import type { TShape } from "../types/shape.type"
import type { MapynaGoogleMapControllers } from "../GoogleMap/GoogleMapControllers"
import type { MapynaLeafletControllers } from "../Leaflet/LeafletControllers"

export abstract class MapynaDrawing {
  root: MapynaLeaflet | MapynaGoogleMap
  controllers: MapynaGoogleMapControllers | MapynaLeafletControllers

  modes: ["freehand", "rectangle", "circle", "polygon"]
  mode: "freehand" | "rectangle" | "circle" | "polygon"
  listeners: {
    [key: string]: {
      event: string
      callback: Function
      listener: google.maps.MapsEventListener | L.Events | null
    }
  }
  $drawingModesContainer: HTMLDivElement | null
  $drawingModeButtons: Record<string, HTMLButtonElement>
  shapeList: {
    mode: "freehand" | "rectangle" | "circle" | "polygon"
    overlay: TShape
  }[]
  callbacks: {
    [key: string]: Function
  }
  geometry:
    | {
        lat: number
        lng: number
      }[]
    | number[][]
    | { center: { lat: number; lng: number }; radius: number }
    | null

  shape: TShape
  shapeLayer: TShape

  constructor(
    root: MapynaLeaflet | MapynaGoogleMap,
    controllers: MapynaGoogleMapControllers | MapynaLeafletControllers
  ) {
    this.root = root
    this.controllers = controllers
    this.modes = ["freehand", "rectangle", "circle", "polygon"]
    this.mode = "polygon"
    this.listeners = {}
    this.$drawingModesContainer = null
    this.$drawingModeButtons = {}
    this.shapeList = []
    this.shape = null
    this.shapeLayer = null
    this.callbacks = {}
    this.geometry = []
  }

  init() {
    const self = this

    this.drawingStart()

    if (self.mode === "freehand") {
      self.addListener(
        "freehandMouseDown",
        "mousedown",
        (e: LeafletMouseEvent | google.maps.MapMouseEvent) => {
          self.freehand(e)
        }
      )
    } else if (self.mode === "rectangle") {
      self.addListener(
        "rectangleMouseDown",
        "mousedown",
        (e: LeafletMouseEvent | google.maps.MapMouseEvent) => {
          self.rectangle(e)
        }
      )
    } else if (self.mode === "polygon") {
      self.polygon()
    } else if (self.mode === "circle") {
      self.addListener(
        "circleMouseDown",
        "mousedown",
        (e: LeafletMouseEvent | google.maps.MapMouseEvent) => {
          self.circle(e)
        }
      )
    }
  }

  createDrawingModes() {
    const self = this

    this.$drawingModesContainer = document.createElement("div")
    this.$drawingModesContainer.classList.add("mapyna-drawing-modes")
    this.$drawingModesContainer.style.display = "none"

    const $drawingModesContainerInner = document.createElement("div")
    $drawingModesContainerInner.classList.add("mapyna-drawing-modes-inner")

    this.$drawingModesContainer.appendChild($drawingModesContainerInner)

    // Append the new div as a child to the parent div
    this.root.$container.appendChild(this.$drawingModesContainer)

    this.controllers.setControllerPosition(
      this.$drawingModesContainer,
      "TOP_CENTER"
    )

    this.modes.forEach((mode) => {
      if (
        mode === "freehand" &&
        window.matchMedia("(pointer:coarse)").matches
      ) {
        return
      }

      this.$drawingModeButtons[mode] =
        self.controllers.createButtonIconController(
          $drawingModesContainerInner,
          config.assets.drawing[mode],
          async () => {
            await self.changeMode.call(self, mode)
          }
        )
    })
  }

  async changeMode(newMode: "freehand" | "rectangle" | "circle" | "polygon") {
    this.destroy()
    this.disableDrawingModeButton()
    this.mode = newMode
    this.init()
  }

  addListener(key: string, event: string, callback: Function) {
    this.listeners[key] = { event, callback, listener: null }
  }

  removeListener(key: string) {
    delete this.listeners[key]
  }

  // TODO: Add an event listener to the map to trigger this
  /* setInitialShape() {
    const { type, geometry } = this.root.config.drawing.payload
    let shape = this.defineShape(type, geometry)
  } */

  drawingStart() {
    this.root.disableMap()
    this.enableCrosshair()
    this.root.disableDragging()
    this.enableDrawingModeButton()
    this.root.infoWindow?.disable()
    this.root.layersObject?.hideAll()
    this.geometry = null
  }

  drawingDone(shape?: TShape) {
    if (shape) {
      this.shapeList.push({
        mode: this.mode,
        overlay: shape
      })

      this.zoomToOverlays()

      this.root.setDrawingJustDone(true)

      eventEmitter.emit("drawingDone", {
        mode: this.mode,
        geometry: this.geometry
      })

      /* this.root.setPayload({
        type: this.mode === "circle" ? this.mode : "polygon",
        geometry: this.geometry
      })
      this.root.emitUpdate() */
    }

    this.disableCrosshair()

    this.root.enableMap()

    this.root.infoWindow?.enable()
    this.root.layersObject?.inactiveAll()
    this.root.layersObject?.showAll()
  }

  enableDrawingModeButton() {
    const $button = this.$drawingModeButtons[this.mode]
    if (!$button) return
    const $icon = $button.querySelector("svg") as SVGSVGElement

    $button.style.background = this.controllers.buttonStyle.activeColor
    $button.style.borderColor = this.controllers.buttonStyle.activeColor

    $icon.style.stroke = "#FFFFFF"
    $icon.style.fill = "#FFFFFF"
  }

  disableDrawingModeButton() {
    const $button = this.$drawingModeButtons[this.mode]
    const $icon = $button.querySelector("svg") as SVGSVGElement

    $button.style.background = this.controllers.buttonStyle.background
    $button.style.border = this.controllers.buttonStyle.border

    $icon.style.stroke = "#000000"
    $icon.style.fill = "#000000"
  }

  showDrawingModes() {
    if (this.$drawingModesContainer) {
      this.$drawingModesContainer.style.display = ""
    }
  }

  hideDrawingModes() {
    if (this.$drawingModesContainer) {
      this.$drawingModesContainer.style.display = "none"
    }
  }

  freehand(e: google.maps.MapMouseEvent | LeafletMouseEvent) {
    const self = this
    const polyMode = self.root.config.closedFreehand ? "polygon" : "polyline"
    const pathList: LatLngLiteral[] = [self.latLngFromMouseEvent(e)]
    this.shape = self.defineShape.call(self, polyMode, pathList)
    let moved = false

    const move = (e: google.maps.MapMouseEvent | LeafletMouseEvent) => {
      moved = true
      pathList.push(self.latLngFromMouseEvent(e))
      self.callbacks.setPathList(this.shape, pathList)
    }

    const up = () => {
      self.removeListener("freehandMouseMove")
      self.removeListener("freehandMouseUp")

      self.callbacks.removeLayer(this.shape)

      if (!moved) {
        if (!this.root.drawingJustDone) {
          self.root.notify?.show("Please draw a shape!", { style: "warn" })
        }
        return
      }

      const simplifiedPath = GDouglasPeucker(pathList, self.root.zoom()!)

      this.shape = self.defineShape.call(self, "polygon", simplifiedPath)

      self.geometry = simplifiedPath

      self.drawingDone.call(self, this.shape)
    }

    self.addListener("freehandMouseMove", "mousemove", move)
    self.addListener("freehandMouseUp", "mouseup", up)
  }

  rectangle(e: LeafletMouseEvent | google.maps.MapMouseEvent) {
    const self = this

    const latLng = self.latLngFromMouseEvent(e)

    let firstCorner = [latLng.lat, latLng.lng]
    let lastCorner = [latLng.lat, latLng.lng]

    this.shape = self.defineShape.call(self, "rectangle", [
      firstCorner,
      lastCorner
    ])

    self.addListener(
      "rectangleMouseMove",
      "mousemove",
      (e: LeafletMouseEvent | google.maps.MapMouseEvent) => {
        const latLng = self.latLngFromMouseEvent(e)
        lastCorner = [latLng.lat, latLng.lng]
        self.callbacks.rectangleOnMove.call(self, this.shape, [
          firstCorner,
          lastCorner
        ])
      }
    )

    self.addListener("rectangleMouseUp", "mouseup", () => {
      self.removeListener("rectangleMouseMove")
      self.removeListener("rectangleMouseDown")
      self.removeListener("rectangleMouseUp")

      self.geometry = [
        { lat: firstCorner[0], lng: firstCorner[1] },
        { lat: firstCorner[0], lng: lastCorner[1] },
        { lat: lastCorner[0], lng: firstCorner[1] },
        { lat: lastCorner[0], lng: lastCorner[1] }
      ]

      self.drawingDone.call(self, this.shape)
    })
  }

  circle(e: google.maps.MapMouseEvent | LeafletMouseEvent) {
    const self = this
    const center = self.latLngFromMouseEvent(e)
    let radius = 0
    this.shape = self.defineShape.call(self, "circle", { center, radius })

    self.addListener(
      "circleMouseMove",
      "mousemove",
      (e: LeafletMouseEvent | google.maps.MapMouseEvent) => {
        const mousePoint = self.latLngFromMouseEvent(e)
        radius = self.calculateDistance.call(self, center, mousePoint)
        self.callbacks.circleOnMove.call(self, this.shape, radius)
      }
    )

    self.addListener("circleMouseUp", "mouseup", () => {
      self.removeListener("circleMouseMove")
      self.removeListener("circleMouseDown")
      self.removeListener("circleMouseUp")

      self.geometry = { center, radius }

      self.drawingDone.call(self, this.shape)
    })
  }

  polygon() {
    const self = this
    let startPoint: LatLngLiteral | null = null
    const pathList: LatLngLiteral[] = []

    self.addListener(
      "polygonClick",
      "click",
      (e: LeafletMouseEvent | google.maps.MapMouseEvent) => {
        const newPoint = self.latLngFromMouseEvent(e)

        if (startPoint === null) {
          startPoint = newPoint
          this.shapeLayer = self.callbacks.defineLayer.call(self)
        }

        const pixelDistance = self.distanceInPx.call(
          self,
          [startPoint.lat, startPoint.lng],
          [newPoint.lat, newPoint.lng]
        )

        if (pathList.length > 2 && pixelDistance && pixelDistance < 7) {
          self.callbacks.removeLayer.call(self, this.shape)

          this.shape = self.defineShape.call(self, "polygon", pathList)

          self.removeListener.call(self, "polygonClick")

          self.callbacks.removeLayer.call(self, this.shapeLayer)

          self.geometry = pathList

          self.drawingDone.call(self, this.shape)
          return
        }

        pathList.push(newPoint)

        self.callbacks.polygonVertex.call(self, this.shapeLayer, newPoint)

        if (this.shape) {
          self.callbacks.setPathList.call(self, this.shape, pathList)
        } else {
          this.shape = self.defineShape.call(self, "polyline", pathList) as
            | google.maps.Polyline
            | L.Polyline
        }
      }
    )
  }

  destroy() {
    for (let key in this.listeners) {
      if (Object.prototype.hasOwnProperty.call(this.listeners, key)) {
        this.removeListener(key)
      }
    }

    if (this.shapeList.length > 0) {
      this.shapeList.forEach((shape) => {
        this.callbacks.removeLayer(shape.overlay)
      })
      this.shapeList = []
    }

    // in case of incomplete drawing
    if (this.shape) {
      this.callbacks.removeLayer(this.shape)
      this.shape = null
    }

    if (this.shapeLayer) {
      this.callbacks.removeLayer(this.shapeLayer)
      this.shapeLayer = null
    }

    this.root.setPayload({
      type: "drawingRemoved",
      geometry: this.root.getBoundsObject()
    })

    if (this.geometry && !this.root?.drawingEnabled) {
      this.root.emitUpdate()
    }

    this.root.setDrawingJustDone(false)

    this.drawingDone()
  }

  abstract defineShape(
    type: string,
    pathList:
      | LatLngLiteral[]
      | number[][]
      | { center: LatLngLiteral; radius: number }
      | null
  ): TShape

  abstract latLngFromMouseEvent(
    e: LeafletMouseEvent | google.maps.MapMouseEvent
  ): LatLngLiteral

  abstract enableCrosshair(): void

  abstract disableCrosshair(): void

  abstract zoomToOverlays(): void

  calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ) {
    const R = 6371e3 // Earth's radius in meters

    // Convert degrees to radians
    const lat1 = this.toRadians(point1.lat)
    const lon1 = this.toRadians(point1.lng)
    const lat2 = this.toRadians(point2.lat)
    const lon2 = this.toRadians(point2.lng)

    // Apply the Haversine formula
    const dLat = lat2 - lat1
    const dLon = lon2 - lon1
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  toRadians(degrees: number) {
    return (degrees * Math.PI) / 180
  }

  distanceInPx(latLng1: [number, number], latLng2: [number, number]) {
    // Get the map projection object
    const zoom = this.root.zoom()

    const projection1 = this.root.project(latLng1, zoom!)
    if (!projection1) return
    const projectedPoint1 = { x: projection1.x, y: projection1.y }

    const projection2 = this.root.project(latLng2, zoom!)
    if (!projection2) return
    const projectedPoint2 = { x: projection2.x, y: projection2.y }

    // Calculate the distance using the Pythagorean theorem
    return Math.sqrt(
      (projectedPoint1.x - projectedPoint2.x) *
        (projectedPoint1.x - projectedPoint2.x) +
        (projectedPoint1.y - projectedPoint2.y) *
          (projectedPoint1.y - projectedPoint2.y)
    )
  }
}
