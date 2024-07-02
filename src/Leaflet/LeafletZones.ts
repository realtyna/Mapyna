import { MapynaZoneLayer } from "../Classes/ZoneLayer"
import type { MapynaLeaflet } from "../MapynaLeaflet"

import type {
  TBoundingBox,
  TLayerCallbackResponse,
  TMapynaLayer
} from "../types/config.type"

export class MapynaLeafletZoneLayer extends MapynaZoneLayer {
  constructor(
    root: MapynaLeaflet,
    {
      layer,
      bounds,
      data
    }: {
      layer: TMapynaLayer
      bounds: TBoundingBox
      data: TLayerCallbackResponse[]
    }
  ) {
    super(root, { layer, bounds, data })
  }

  createPolygon(coordinates: L.LatLngLiteral[]) {
    const leafletCoordinates = coordinates.map((coord) => [
      coord.lat,
      coord.lng
    ]) as L.LatLngExpression[]
    return L.polygon(leafletCoordinates, {
      color: this.style.strokeColor,
      weight: this.style.strokeWeight,
      opacity: this.style.strokeOpacity,
      fillColor: this.style.fillColor,
      fillOpacity: this.style.fillOpacity
    }).addTo(this.root.map as L.Map)
  }

  addListener(polygon: L.Polygon, action: string, callback: Function) {
    polygon.on(action, function (event) {
      if (polygon.options.interactive) {
        callback(event)
      }
    })
  }

  removePolygon(polygon: L.Polygon) {
    polygon.removeFrom(this.root.map as L.Map)
  }

  setVisible(polygon: L.Polygon, visible: boolean) {
    polygon.setStyle({
      opacity: visible ? 1 : 0,
      interactive: visible,
      fillOpacity: visible ? this.style.fillOpacity : 0
    })
  }

  polygonHover(polygon: L.Polygon, isHover: boolean) {
    let color
    if (isHover) {
      color = this.hoverColor
    } else if (polygon === this.activePolygon) {
      color = this.activeColor.fill
    } else {
      color = this.style.fillColor
    }

    polygon.setStyle({ fillColor: color })
  }

  polygonActive(polygon: L.Polygon, isActive: boolean) {
    super.polygonActive(polygon, isActive)
    polygon.setStyle({
      color: isActive ? this.activeColor.fill : this.style.strokeColor,
      fillColor: isActive ? this.activeColor.stroke : this.style.fillColor
    })
  }
}
