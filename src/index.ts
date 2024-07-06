import { MapynaGoogleMap } from "./MapynaGoogleMap"
import { MapynaLeaflet } from "./MapynaLeaflet"
import type { TMapynaConfig } from "./types/config.type"
import "../public/styles.css"

/**
 * @param {TMapynaConfig} params - Configuration parameters for Mapyna
 */

function mapyna(params: TMapynaConfig) {
  const leaflet = () => {
    const mapynaInstance = new MapynaLeaflet(params)
    mapynaInstance.init()
    return mapynaInstance
  }

  const googleMap = () => {
    const mapynaInstance = new MapynaGoogleMap(params)
    mapynaInstance.init()
    return mapynaInstance
  }

  return { leaflet, googleMap }
}

if (typeof window !== "undefined") {
  window.Mapyna = mapyna
}

export default mapyna

export type { TMapynaConfig }
