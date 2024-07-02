import { MapynaInfoWindow } from "../Classes/InfoWindow"
import type { MapynaGoogleMap } from "../MapynaGoogleMap"

export class MapynaGoogleMapInfoWindow extends MapynaInfoWindow {
  constructor(root: MapynaGoogleMap, options = {}) {
    super(root, options)
  }

  linkToPoint(
    $marker: google.maps.marker.AdvancedMarkerElement,
    pointData: Record<string, any>,
    eventName?: string
  ) {
    const result = super.linkToPointer($marker, pointData)

    if (!result) {
      return
    }

    let trigger: string = this.options?.trigger || "click"

    trigger = trigger === "mouseover" ? "mouseenter" : trigger

    if (trigger !== "click") {
      $marker.addEventListener(trigger, result.showInfoWindow)
    } else {
      google.maps.event.addListener(
        $marker,
        eventName ?? "spider_click",
        result.showInfoWindow
      )
    }
  }
}
