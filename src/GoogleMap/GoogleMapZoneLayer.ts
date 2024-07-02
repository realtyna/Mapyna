import { MapynaZoneLayer } from "../Classes/ZoneLayer"
import type { MapynaGoogleMap } from "../MapynaGoogleMap"
import type {
  TBoundingBox,
  TLayerCallbackResponse,
  TMapynaLayer
} from "../types/config.type"

export class MapynaGoogleMapZoneLayer extends MapynaZoneLayer {
  constructor(
    root: MapynaGoogleMap,
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

  createPolygon(coordinates: any) {
    return new google.maps.Polygon({
      paths: coordinates,
      map: this.root.map as google.maps.Map,
      ...this.style
      //clickable: false
    })
  }

  addListener(
    polygon: google.maps.Polygon,
    action: string,
    callback: (event: any) => void
  ) {
    google.maps.event.addListener(polygon, action, function (event: unknown) {
      callback(event)
    })
  }

  removePolygon(polygon: google.maps.Polygon) {
    polygon.setMap(null)
  }

  setVisible(polygon: google.maps.Polygon, visible: boolean) {
    polygon.setOptions({ visible: visible })
  }

  polygonHover(polygon: google.maps.Polygon, isHover: boolean) {
    let color
    if (isHover) {
      color = this.hoverColor
    } else if (polygon === this.activePolygon) {
      color = this.activeColor.fill
    } else {
      color = this.style.fillColor
    }

    polygon.setOptions({ fillColor: color })
  }

  polygonActive(polygon: google.maps.Polygon, isActive: boolean) {
    super.polygonActive(polygon, isActive)
    polygon.setOptions({
      strokeColor: isActive ? this.activeColor.fill : this.style.strokeColor,
      fillColor: isActive ? this.activeColor.stroke : this.style.fillColor
    })
  }
}
