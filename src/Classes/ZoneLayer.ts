import type { MapynaGoogleMap } from "../MapynaGoogleMap"
import type { MapynaLeaflet } from "../MapynaLeaflet"
import { GDouglasPeucker } from "../helpers"
import type {
  TBoundingBox,
  TLayerCallbackGeometry,
  TLayerCallbackProperties,
  TLayerCallbackResponse,
  TMapynaLayer
} from "../types/config.type"

export class MapynaZoneLayer {
  root: MapynaLeaflet | MapynaGoogleMap
  layer: TMapynaLayer
  bounds: TBoundingBox | null
  data: TLayerCallbackResponse[]
  zones: {
    [key: string]: {
      properties: TLayerCallbackProperties
      polygons: L.Polygon[] | google.maps.Polygon[]
    }
  }
  activePolygon: L.Polygon | google.maps.Polygon | null
  style
  hoverColor
  activeColor

  constructor(
    root: MapynaLeaflet | MapynaGoogleMap,
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
    this.root = root
    this.layer = layer
    this.bounds = bounds
    this.data = data
    this.zones = {}
    this.activePolygon = null

    this.style = {
      strokeColor: "#460000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "transparent",
      fillOpacity: 0.2
    }

    this.hoverColor = "#dc0000"
    this.activeColor = {
      fill: "#4085ff",
      stroke: "#0038a4"
    }

    this.load()
  }

  load(data: TLayerCallbackResponse[] | null = null) {
    if (data) {
      this.data = data
    }

    for (const zone of this.data) {
      const { id, properties, geometry } = zone
      this.addZone(id, properties, geometry)
    }
  }

  createDetailsCard(properties: TLayerCallbackProperties) {
    if (this.layer.name === "zipcodes") {
      this.createZipcodeCard(properties)
    }
  }

  removeDetailsCard() {
    const elements = document.getElementsByClassName("mapyna-zone-details-card")
    while (elements.length > 0) {
      elements[0].parentNode?.removeChild(elements[0])
    }
  }

  createZipcodeCard(properties: TLayerCallbackProperties) {
    const $div = document.createElement("div")
    $div.classList.add("mapyna-zone-details-card")
    $div.classList.add("mapyna-zipcode-details-card")

    $div.style.cssText = `padding: 10px;
                              position: absolute;
                              bottom: 0;
                              left: 0;
                              right: 0;
                              z-index: 600000;`

    const $divInner = document.createElement("div")
    $divInner.classList.add("mapyna-zone-details-inner")

    $divInner.style.cssText = `padding: 5px;
                               border-radius: 5px;
                               background: rgb(0, 0, 0, 0.6);
                               width: '100%';
                               display: inline-block;
                               text-align: center;`

    this.addDetailsMeta($divInner, "id", null, properties["ZIP_CODE"])
    this.addDetailsMeta($divInner, "category", "Category", "Zipcode")
    this.addDetailsMeta(
      $divInner,
      "area",
      "Area",
      `${properties["PO_NAME"]}, ${properties["STATE"]}`
    )
    this.addDetailsMeta(
      $divInner,
      "population",
      "Population",
      properties["POPULATION"]
    )
    this.addDetailsMeta($divInner, "sqmi", "SqMi", properties["SQMI"])
    this.addDetailsMeta(
      $divInner,
      "popsqmi",
      "Pop/SqMi",
      properties["POP_SQMI"]
    )

    $div.appendChild($divInner)

    this.root.$container.appendChild($div)
  }

  addDetailsMeta = (
    $container: HTMLElement,
    name: string,
    label: string | null,
    value: string | number
  ) => {
    const $meta = document.createElement("div")
    $meta.classList.add("mapyna-zone-details-meta")
    $meta.classList.add("mapyna-zone-details-" + name)

    if (label) {
      const $metaLabel = document.createElement("strong")
      $metaLabel.classList.add("mapyna-zone-details-meta-label")
      $metaLabel.innerText = label + ": "

      $meta.appendChild($metaLabel)
    }

    const $metaValue = document.createElement("span")
    $metaValue.classList.add("mapyna-zone-details-meta-value")
    $metaValue.innerText = value as string
    $meta.appendChild($metaValue)

    $container.appendChild($meta)
  }

  addZone(
    id: string,
    properties: TLayerCallbackProperties,
    geometry: TLayerCallbackGeometry
  ) {
    if (this.zones && id in this.zones) {
      return
    }

    const { coordinates } = geometry

    const polygons: L.Polygon[] | google.maps.Polygon[] = []

    const self = this
    for (const polygonCoordinates of coordinates) {
      const polygon = this.createPolygon(
        polygonCoordinates
      ) as unknown as L.Polygon & google.maps.Polygon
      polygons.push(polygon)

      this.addListener(polygon, "mouseover", () => {
        self.createDetailsCard.call(self, properties)
        self.polygonHover(polygon, true)
      })

      this.addListener(polygon, "mouseout", () => {
        self.removeDetailsCard()
        self.polygonHover(polygon, false)
      })

      this.addListener(polygon, "click", () => {
        const zoom = self.root.zoom()
        let simplified

        if (zoom) {
          simplified = GDouglasPeucker(
            polygonCoordinates as {
              lat: number
              lng: number
            }[],
            zoom
          )
        }

        self.root.setPayload({
          type: "zone",
          geometry: simplified
        })
        self.root.emitUpdate()

        self.polygonActive(polygon, true)
      })
    }

    this.zones[id] = {
      properties: properties,
      polygons: polygons
    }
  }

  removeZone(id: string) {
    for (const polygon of this.zones[id].polygons) {
      this.removePolygon(polygon)
    }
    delete this.zones[id]
  }

  removeAll() {
    for (let id in this.zones) {
      if (Object.prototype.hasOwnProperty.call(this.zones, id)) {
        this.removeZone(id)
      }
    }

    this.bounds = null

    this.removeActivePolygon(true)
  }

  setVisibleAll(visible: boolean) {
    for (let id in this.zones) {
      if (Object.prototype.hasOwnProperty.call(this.zones, id)) {
        for (const polygon of this.zones[id].polygons) {
          this.setVisible(polygon, visible)
        }
      }
    }
  }

  createPolygon(polygonCoordinates: any) {}
  removePolygon(polygon: L.Polygon | google.maps.Polygon) {}
  addListener(
    polygon: L.Polygon | google.maps.Polygon,
    action: string,
    callback: Function
  ) {}
  setVisible(polygon: L.Polygon | google.maps.Polygon, visible: boolean) {}
  polygonHover(polygon: L.Polygon | google.maps.Polygon, isHover: boolean) {}

  polygonActive(polygon: L.Polygon | google.maps.Polygon, isActive: boolean) {
    if (isActive) {
      this.removeActivePolygon()
    }

    this.activePolygon = polygon
  }
  removeActivePolygon(payloadUpdate = false) {
    if (this.activePolygon) {
      this.polygonActive(this.activePolygon, false)
      this.activePolygon = null

      if (payloadUpdate) {
        this.root.setPayload({
          type: "zoneRemoved",
          geometry: this.root.getBoundsObject()
        })
        this.root.emitUpdate()
      }
    }
  }
}
