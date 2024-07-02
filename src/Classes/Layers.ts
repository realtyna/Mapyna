import type { LatLng } from "leaflet"
import type { MapynaGoogleMap } from "../MapynaGoogleMap"
import type { MapynaLeaflet } from "../MapynaLeaflet"
import config from "../config"
import type {
  TBoundingBox,
  TLayerCallbackResponse,
  TMapynaLayer
} from "../types/config.type"
import type { MapynaPointLayer } from "./PointLayer"
import { MapynaZoneLayer } from "./ZoneLayer"

export abstract class MapynaLayers {
  root: MapynaLeaflet | MapynaGoogleMap
  activeLayers: string[]
  layers: Record<string, MapynaZoneLayer | MapynaPointLayer>
  $popup: HTMLDivElement | null
  notifyId?: number | string | null
  bounds: any
  popupEnabled: boolean

  constructor(root: MapynaLeaflet | MapynaGoogleMap) {
    this.root = root
    this.activeLayers = []
    this.layers = {}
    this.$popup = null
    this.notifyId = null
    this.bounds = {}
    this.popupEnabled = false
    this.init()
  }

  init() {
    const self = this

    this.root.on("viewUpdated", async (newBounds: TBoundingBox) => {
      await self.loadLayers.call(self, newBounds)
    })
  }

  async loadLayers(newBounds: TBoundingBox) {
    for (const layerName of this.activeLayers) {
      await this.loadLayer(layerName, newBounds)
    }
  }

  async removeLayer(layerName: string) {
    if (layerName in this.layers) {
      this.layers[layerName].removeAll()
      delete this.layers[layerName]
    }

    if (this.bounds && layerName in this.bounds) {
      delete this.bounds[layerName]
    }

    if (this.notifyId) {
      this.root.notify?.hide(this.notifyId as number)
      this.notifyId = null
    }
  }

  async loadLayer(layerName: string, newBounds: TBoundingBox, callback?: any) {
    const layer = this.root.config.layers[layerName] as TMapynaLayer

    if (!this.isLayerLoadable(layerName, layer)) {
      return
    }

    if (this.bounds && !(layerName in this.bounds)) {
      this.bounds[layerName] = this.root.defineBounds() as unknown as LatLng
    }

    const shouldDraw = await this.extend(layerName, newBounds)

    if (!shouldDraw) {
      return null
    }

    let layerData: TLayerCallbackResponse[] | null = null

    this.root.showLoading()

    if (typeof layer.fetchCallback === "function") {
      layerData = await layer.fetchCallback(newBounds)
    }

    if (!layerData && this.root.config.rfEnabled) {
      layerData = await this.root.rf?.fetchLayerData(layerName, newBounds)
    }

    this.root.hideLoading()

    if (layerData) {
      if (layerName in this.layers) {
        this.layers[layerName].load(layerData)
      } else {
        callback({ layer, bounds: newBounds, data: layerData })
      }
    }

    return layerData
  }

  isLayerLoadable(layerName: string, layer: TMapynaLayer) {
    if (!layer.minZoom) {
      return true
    }

    if (this.root.zoom()! < layer.minZoom) {
      if (this.notifyId === null) {
        const self = this
        this.notifyId = this.root.notify?.show(
          "Zoom more to see the " + layerName,
          {
            style: "info",
            persist: true,
            onClose: () => {
              self.notifyId = "closed"
            }
          }
        )
      }
      return false
    } else if (this.notifyId) {
      if (this.notifyId !== "closed") {
        this.root.notify?.hide(this.notifyId as number)
      }
      this.notifyId = null
    }

    return true
  }

  addActiveLayer(layerName: string) {
    this.activeLayers.push(layerName)
    this.root.controllers?.updateBadge("layers", this.activeLayers.length)
  }

  removeActiveLayer(layerName: string) {
    let indexOfElement = this.activeLayers.indexOf(layerName)
    if (indexOfElement !== -1) {
      this.activeLayers.splice(indexOfElement, 1)
    }

    this.root.controllers?.updateBadge("layers", this.activeLayers.length)
  }

  createPopup($button: HTMLElement, positionCode: string) {
    this.$popup = document.createElement("div")
    this.$popup.classList.add("mapyna-layers-popup")

    for (const layerName in this.root.config.layers) {
      const layer = this.root.config.layers[layerName]
      if (!layer.enabled) {
        continue
      }

      this.createLayerButton(layerName, layer.label)
    }

    this.setPopupPosition($button, positionCode)

    this.root.$container.appendChild(this.$popup)

    this.popupEnabled = false
  }

  setPopupPosition($button: HTMLElement, positionCode: string) {
    const [firstPos, secondPos] = positionCode.toLowerCase().split("_")
    const mapHeight = this.root.$container.offsetHeight
    const mapWidth = this.root.$container.offsetWidth

    const buttonSize = ["top", "bottom"].includes(firstPos)
      ? $button.offsetHeight
      : $button.offsetWidth

    let buttonOffset
    if (secondPos === "top") {
      buttonOffset = $button.offsetTop
    } else if (secondPos === "bottom") {
      buttonOffset = mapHeight - $button.offsetTop - $button.offsetHeight
    } else if (secondPos === "left") {
      buttonOffset = $button.offsetLeft
    } else if (secondPos === "right") {
      buttonOffset = mapWidth - $button.offsetLeft - $button.offsetWidth
    }

    if (this.$popup) {
      this.$popup.style.setProperty(
        firstPos,
        buttonSize + this.root.config.controllerSpace + "px"
      )

      this.$popup.style.setProperty(
        secondPos,
        buttonOffset! + this.root.config.controllerSpace + "px"
      )
    }
  }

  createLayerButton(buttonName: string, buttonLabel: string) {
    const self = this

    // Create a new div element
    const $popupItem = document.createElement("div")

    // Assign a class to the new div
    $popupItem.classList.add("mapyna-layer-popup-item")
    $popupItem.classList.add("mapyna-layer-popup-" + buttonName)
    $popupItem.style.padding = "5px"

    const $button = document.createElement("div")
    $button.classList.add("mapyna-layer-popup-button")

    const $controllerIcon = document.createElement("div")
    $controllerIcon.classList.add("mapyna-layer-popup-icon")
    $controllerIcon.innerHTML = config.assets.controllers[buttonName]

    const $controllerText = document.createElement("div")
    $controllerText.classList.add("mapyna-layer-popup-text")
    $controllerText.innerHTML = buttonLabel

    $button.appendChild($controllerIcon)
    $button.appendChild($controllerText)

    $button.addEventListener("click", async () => {
      const isEnabled = self.activeLayers.includes(buttonName)
      const bounds = self.root.getBoundsObject()

      if (isEnabled) {
        $button.classList.remove("active")
        self.removeActiveLayer(buttonName)
        await self.removeLayer(buttonName)
      } else {
        $button.classList.add("active")
        self.addActiveLayer(buttonName)
        if (!bounds) return
        await self.loadLayer(buttonName, bounds)
      }
    })

    $popupItem.appendChild($button)

    // Append the new div as a child to the parent div
    this.$popup?.appendChild($popupItem)

    if (self.root.controllers) {
      self.root.controllers.$controllers[buttonName] = $popupItem
    }
  }

  togglePopup() {
    if (this.popupEnabled) {
      this.root.controllers?.disableControllerButton("layers", "fill")
      this.$popup?.classList.remove("active")
    } else {
      this.root.controllers?.enableControllerButton("layers", "fill")
      this.$popup?.classList.add("active")
    }

    this.popupEnabled = !this.popupEnabled
  }

  hideAll() {
    this.setVisibleAll(false)
  }

  inactiveAll() {
    for (const layerName in this.root.config.layers) {
      if (!this.activeLayers.includes(layerName)) {
        continue
      }

      const layerInstance = this.layers[layerName]

      if (
        layerInstance instanceof MapynaZoneLayer &&
        typeof layerInstance.removeActivePolygon === "function"
      ) {
        layerInstance.removeActivePolygon(false)
      }
    }
  }

  showAll() {
    this.setVisibleAll(true)
  }

  abstract extend(layerName: string, bounds: TBoundingBox): Promise<boolean>

  setVisibleAll(visible: boolean) {
    for (const layerName in this.root.config.layers) {
      if (!this.activeLayers.includes(layerName)) {
        continue
      }

      const layerInstance = this.layers[layerName]
      if (layerInstance instanceof MapynaZoneLayer) {
        layerInstance.setVisibleAll(visible)
      }
    }
  }
}
