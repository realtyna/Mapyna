import { MapynaInfoWindow } from "../Classes/InfoWindow"
import type { MapynaLeaflet } from "../MapynaLeaflet"

export class MapynaLeafletInfoWindow extends MapynaInfoWindow {
  constructor(root: MapynaLeaflet, options = {}) {
    super(root, options)
  }

  linkToPoint(marker: L.Marker, pointData: Record<string, any>) {
    const result = super.linkToPointer(marker as any, pointData)

    if (!result) {
      return
    }

    const trigger = this.options?.trigger || "click"

    marker.on(trigger, (e) => {
      L.DomEvent.stopPropagation(e)
      result.showInfoWindow()
    })
  }
}
