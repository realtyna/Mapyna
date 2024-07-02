import type { LeafletEventHandlerFn, LeafletMouseEvent } from "leaflet"
import { MapynaDrawing } from "../Classes/Drawing"
import { MapynaLeaflet } from "../MapynaLeaflet"

export class MapynaLeafletDrawing extends MapynaDrawing {
  drawingStyle
  setInitialShape

  constructor(root: MapynaLeaflet, controllers: any) {
    super(root, controllers)

    this.setInitialShape = () => {}

    this.drawingStyle = {
      color: root.config.drawing.style.strokeColor,
      opacity: root.config.drawing.style.strokeOpacity,
      weight: root.config.drawing.style.strokeWeight,
      fillColor: root.config.drawing.style.fillColor,
      fillOpacity: root.config.drawing.style.fillOpacity
    }

    this.callbacks = {
      setPathList: (shape: L.Polygon | L.Polyline, pathList: L.LatLng[]) =>
        shape.setLatLngs(pathList),
      removeLayer: (layer: L.Layer) => {
        if (this.root.map instanceof L.Map) {
          this.root.map?.removeLayer(layer)
        }
      },
      rectangleOnMove: (shape: L.Rectangle, corners: L.LatLng[]) => {
        shape.setLatLngs(corners)
        shape.setBounds(L.latLngBounds(corners[0], corners[1]))
      },
      circleOnMove: (shape: L.Circle, radius: number) =>
        shape.setRadius(radius),
      defineLayer: () => {
        const layer = L.layerGroup()
        if (this.root.map instanceof L.Map) {
          this.root.map?.addLayer(layer)
        }
        return layer
      },
      polygonVertex: (layer: L.LayerGroup, point: L.LatLng) => {
        L.circleMarker(point, {
          radius: 3,
          color: this.drawingStyle.color
        }).addTo(layer)
      }
    }

    if (this.root.config.drawing.payload) {
      this.setInitialShape()
    }
  }

  enableCrosshair() {
    this.root.$map.style.cursor = "crosshair"
  }

  disableCrosshair() {
    this.root.$map.style.cursor = ""
  }

  addListener(key: string, event: string, callback: Function) {
    super.addListener(key, event, callback)
    if (this.root.map instanceof L.Map) {
      this.root.map.on(
        event,
        this.listeners[key].callback as LeafletEventHandlerFn
      )
    }
  }

  removeListener(key: string) {
    if (key in this.listeners && this.root.map instanceof L.Map) {
      this.root.map.off(
        this.listeners[key].event,
        this.listeners[key].callback as LeafletEventHandlerFn
      )
      super.removeListener(key)
    }
  }

  latLngFromMouseEvent(event: LeafletMouseEvent) {
    return event.latlng
  }

  defineShape(type: string, data: any) {
    let shape = null

    if (["polygon", "polyline"].includes(type)) {
      if (type === "polyline") {
        shape = L.polyline(data, this.drawingStyle)
      } else if (type === "polygon") {
        shape = L.polygon(data, this.drawingStyle)
      }
    } else if (type === "rectangle") {
      shape = L.rectangle(data, this.drawingStyle)
    } else if (type === "circle") {
      const centerPoint: L.LatLngExpression = [data.center.lat, data.center.lng]
      shape = L.circle(
        centerPoint,
        data.radius,
        this.drawingStyle as L.CircleMarkerOptions
      )
    }

    if (shape) {
      shape.addTo(this.root.map as L.Map)
    }

    return shape
  }

  // Function to zoom the map to fit the overlays
  zoomToOverlays() {
    if (!this.root.config.zoomAfterDrawing || this.shapeList.length === 0) {
      return
    }

    const bounds = this.root.defineBounds() as L.LatLngBounds

    this.shapeList.forEach((shape) => {
      if (shape.overlay && "getBounds" in shape.overlay) {
        bounds.extend(shape.overlay.getBounds() as any)
      }
    })

    if (this.root instanceof MapynaLeaflet) {
      this.root.fitBounds(bounds)
    }
  }
}
