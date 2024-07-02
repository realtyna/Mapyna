/* eslint-disable no-unused-vars */

import type { TMapynaConfig } from "./config.type"
import type { MapynaLeaflet } from "../MapynaLeaflet"
import type { MapynaGoogleMap } from "../MapynaGoogleMap"

declare global {
  interface Window {
    Mapyna(params: TMapynaConfig): {
      leaflet: () => MapynaLeaflet
      googleMap: () => MapynaGoogleMap
    }
    MapynaData?: any
  }
}

export {}
