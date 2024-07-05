import type {
  TBoundingBox,
  TLayerCallbackProperties,
  TLayerCallbackResponse
} from "../types/config.type"
import type { MapynaMap } from "./Map"

export class MapynaRealtyFeedIntegration {
  root: MapynaMap<google.maps.Map | L.Map>
  resolution: number
  calls: Record<string, AbortController>

  constructor(root: MapynaMap<google.maps.Map | L.Map>) {
    this.root = root
    this.resolution = 0.9
    this.calls = {}
  }

  async rfCall(endpoint: string, method: string, params: any) {
    const url = new URL(endpoint, this.root.config.rfIntegration.apiBase)

    // Default headers for JSON content
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + this.root.config.rfIntegration.token
    }

    const options: RequestInit = {
      method,
      headers: headers
    }

    if (params) {
      options.body = JSON.stringify(params)
    }

    if (this.calls[endpoint]) {
      this.calls[endpoint].abort()
      delete this.calls[endpoint]
    }

    this.calls[endpoint] = new AbortController()

    options.signal = this.calls[endpoint].signal

    return fetch(url, options)
      .then((response) => {
        delete this.calls[endpoint]

        if (response.ok) {
          return response.json()
        }

        return null
      })
      .catch(() => {
        return null
      })
  }

  async getWithBounds(type: string, newBounds: TBoundingBox, idKey: string) {
    let url = "/geo/" + type + "/boundingbox"
    url += "?resolution=" + this.resolution
    //url += '&limit=30';
    const boundaries = await this.rfCall(url, "POST", {
      top_left: {
        lat: newBounds.northWest.lat,
        lon: newBounds.northWest.lng
      },
      bottom_right: {
        lat: newBounds.southEast.lat,
        lon: newBounds.southEast.lng
      }
    })

    if (!boundaries) {
      return null
    }

    return this.boundaryMapping(boundaries, idKey)
  }

  async getZipcodesWithBounds(newBounds: TBoundingBox) {
    return await this.getWithBounds("zipcode", newBounds, "ZIP_CODE")
  }

  async getNeighbourhoodsWithBounds(newBounds: TBoundingBox) {
    return await this.getWithBounds("neighbourhood", newBounds, "RegionID")
  }

  async getSchoolDistricts(newBounds: TBoundingBox) {
    const url = "/geo/schools/publicsch/boundingbox"

    const schools = await this.rfCall(url, "POST", {
      top_left: {
        lat: newBounds.northWest.lat,
        lon: newBounds.northWest.lng
      },
      bottom_right: {
        lat: newBounds.southEast.lat,
        lon: newBounds.southEast.lng
      }
    })

    if (!schools) {
      return null
    }

    return schools.data
    //return this.pointMapping(schools.data);
  }

  boundaryMapping(boundaries: TLayerCallbackResponse[], idKey: string) {
    return boundaries.map((bound) => {
      const { properties, geometry } = bound
      const { coordinates, type } = geometry

      const convertedCoordinates = coordinates.map((polygon: any[]) => {
        if (type === "MultiPolygon") {
          return polygon[0].map(([lng, lat]: number[]) => ({ lat, lng }))
        }
        return polygon.map(([lng, lat]: number[]) => ({ lat, lng }))
      })

      const convertedGeometry = {
        ...geometry,
        coordinates: convertedCoordinates
      }

      return {
        ...bound,
        geometry: convertedGeometry,
        id: properties[idKey as keyof TLayerCallbackProperties]
      }
    })
  }

  /*pointMapping (points) {
        return points.map(point => {
            point.LAT = parseFloat(property.INTPTLAT);
            point.LON = parseFloat(property.INTPTLON);
            return point;
        });
    }*/

  async fetchLayerData(layerName: string, bounds: TBoundingBox) {
    let layerData = null

    if (layerName === "zipcodes") {
      layerData = await this.root.rf?.getZipcodesWithBounds(bounds)
    } else if (layerName === "neighbourhoods") {
      layerData = await this.root.rf?.getNeighbourhoodsWithBounds(bounds)
    } else if (layerName === "schools") {
      layerData = await this.root.rf?.getSchoolDistricts(bounds)
    }

    return layerData
  }
}
