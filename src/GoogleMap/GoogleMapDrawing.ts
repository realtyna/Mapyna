import { MapynaDrawing } from "../Classes/Drawing"
import { MapynaGoogleMap } from "../MapynaGoogleMap"
import type { TShape } from "../types/shape.type"

export class MapynaGoogleMapDrawing extends MapynaDrawing {
  drawingStyle
  setInitialShape: () => void

  constructor(root: MapynaGoogleMap, controllers: any) {
    super(root, controllers)

    this.drawingStyle = root.config.drawing.style
    this.setInitialShape = () => {}

    this.callbacks = {
      setPathList: (
        shape: google.maps.Polygon | google.maps.Polyline,
        pathList: google.maps.LatLngLiteral[]
      ) => {
        if (shape) {
          return shape.setPath(pathList)
        }
      },

      removeLayer: (layer: TShape[] | TShape) => {
        if (Array.isArray(layer)) {
          layer.forEach((feature) => {
            if (feature && "setMap" in feature) {
              feature.setMap(null)
            }
          })
        } else if (layer) {
          if (layer && "setMap" in layer) {
            layer.setMap(null)
          }
        }
      },
      rectangleOnMove: (shape: google.maps.Rectangle, corners: number[][]) => {
        const bounds = this.getRectangleBounds(corners)
        shape.setBounds(bounds)
      },
      circleOnMove: (shape: google.maps.Circle, radius: number) =>
        shape.setRadius(radius),
      defineLayer: () => {
        return []
      },
      polygonVertex: (
        layer: google.maps.Circle[],
        point: google.maps.LatLngLiteral
      ) => {
        const marker = new google.maps.Circle({
          center: point,
          radius: this.getRadiusInMeters(point, 3),
          strokeColor: this.drawingStyle.strokeColor,
          fillColor: this.drawingStyle.fillColor,
          fillOpacity: 1,
          zIndex: google.maps.Marker.MAX_ZINDEX + 1,
          map: this.root.map as google.maps.Map,
          clickable: false
        })
        layer.push(marker)
      }
    }

    if (this.root.config.drawing.payload) {
      this.setInitialShape()
    }
  }

  getRectangleBounds(corners: number[][]) {
    const firstCorner = new google.maps.LatLng(corners[0][0], corners[0][1])
    const lastCorner = new google.maps.LatLng(corners[1][0], corners[1][1])

    if (corners[0][1] < corners[1][1]) {
      return new google.maps.LatLngBounds(firstCorner, lastCorner)
    } else {
      return new google.maps.LatLngBounds(lastCorner, firstCorner)
    }
  }

  enableCrosshair() {
    if (this.root.map && "setOptions" in this.root.map) {
      this.root.map?.setOptions({
        draggableCursor:
          "url(https://maps.gstatic.com/mapfiles/crosshair.cur) 7 7, crosshair"
      })
    }
  }

  disableCrosshair() {
    if (this.root.map && "setOptions" in this.root.map) {
      this.root.map.setOptions({ draggableCursor: null })
    }
  }

  addListener(key: string, event: string, callback: Function) {
    super.addListener(key, event, callback)
    this.listeners[key].listener = google.maps.event.addListener(
      this.root.map as google.maps.Map,
      event,
      this.listeners[key].callback
    )
  }

  removeListener(key: string) {
    if (key in this.listeners) {
      google.maps.event.removeListener(
        this.listeners[key].listener as google.maps.MapsEventListener
      )
      super.removeListener(key)
    }
  }

  latLngFromMouseEvent(event: google.maps.MapMouseEvent) {
    return {
      lat: event.latLng?.lat() as number,
      lng: event.latLng?.lng() as number
    }
  }

  defineShape(
    type: string,
    pathList:
      | google.maps.LatLngLiteral[]
      | number[][]
      | { center: google.maps.LatLngLiteral; radius: number }
      | null
  ) {
    const styles = { clickable: false, ...this.drawingStyle, zIndex: 9999 }
    let shape = null
    let bounds = null
    let centerPoint = null

    switch (type) {
      case "polygon":
        shape = new google.maps.Polygon({
          paths: pathList as google.maps.LatLngLiteral[],
          ...styles
        })
        break
      case "polyline":
        shape = new google.maps.Polyline({
          path: pathList as google.maps.LatLngLiteral[],
          ...styles
        })
        break
      case "rectangle":
        bounds = this.getRectangleBounds(pathList as number[][])
        shape = new google.maps.Rectangle({ bounds, ...styles })
        break
      case "circle":
        if (pathList && "center" in pathList && "radius" in pathList) {
          centerPoint = new google.maps.LatLng(
            pathList.center.lat,
            pathList.center.lng
          )
          shape = new google.maps.Circle({
            center: centerPoint,
            radius: pathList.radius,
            ...styles
          })
        }

        break
    }

    if (shape) {
      shape.setMap(this.root.map as google.maps.Map)
    }

    return shape
  }

  // Function to zoom the map to fit the overlays
  zoomToOverlays() {
    if (!this.root.config.zoomAfterDrawing || this.shapeList.length === 0) {
      return
    }

    const bounds = this.root.defineBounds() as google.maps.LatLngBounds

    this.shapeList.forEach((shape) => {
      if (
        ["freehand", "polygon"].includes(shape.mode) &&
        shape.overlay instanceof google.maps.Polyline
      ) {
        const shapePath = shape.overlay.getPath()

        shapePath.forEach((latLng) => {
          bounds.extend(latLng)
        })
      } else if (
        ["circle", "rectangle"].includes(shape.mode) &&
        (shape.overlay instanceof google.maps.Circle ||
          shape.overlay instanceof google.maps.Rectangle)
      ) {
        const shapeBounds = shape.overlay.getBounds()

        if (shapeBounds) {
          bounds.extend(shapeBounds.getNorthEast())
          bounds.extend(shapeBounds.getSouthWest())
        }
      }
    })

    if (this.root instanceof MapynaGoogleMap) {
      this.root.fitBounds(bounds)
    }
  }

  getRadiusInMeters(point: google.maps.LatLngLiteral, radiusInPixels: number) {
    const zoom = this.root.zoom()

    if (!zoom) {
      return null
    }
    const metersPerPixel =
      (156543.03392 * Math.cos((point.lat * Math.PI) / 180)) / 2 ** zoom
    return radiusInPixels * metersPerPixel
  }
}
