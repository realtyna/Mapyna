import type { MapynaGoogleMapDrawing } from "../GoogleMap/GoogleMapDrawing"
import type { MapynaLeafletDrawing } from "../Leaflet/LeafletDrawing"
import type { MapynaGoogleMap } from "../MapynaGoogleMap"
import type { MapynaLeaflet } from "../MapynaLeaflet"
import config from "../config"
import type { EControllersPosition } from "../types/config.type"

export class MapynaControllers {
  root: MapynaLeaflet | MapynaGoogleMap
  $badges: Record<string, HTMLElement> = {}
  drawing: MapynaGoogleMapDrawing | MapynaLeafletDrawing | null
  drawingEnabled: boolean
  buttonStyle: {
    background: string
    activeColor: string
    border: string
    boxShadow: string
    width: string
    height: string
  }
  $controllers: Record<string, HTMLElement> = {}
  constructor(root: MapynaLeaflet | MapynaGoogleMap) {
    this.root = root

    this.drawing = null

    this.drawingEnabled = false

    this.buttonStyle = {
      background: "#f2f2f2",
      activeColor: "#e74c3c",
      border: "1px solid #ccc",
      boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
      width: "32px",
      height: "32px"
    }

    this.init()
  }

  init() {
    for (const [key, positionCode] of Object.entries(
      this.root.config.controllers
    )) {
      const controllerCreators = {
        zoomX: this.createZoomController,
        zoomY: this.createZoomController,
        view: this.createViewController,
        draw: (el: HTMLElement) => {
          this.setDrawingInstance()
          this.createDrawController(el)
        },
        layers: (el: HTMLElement) =>
          this.createLayersController(el, positionCode)
      }
      const controllerCreator =
        controllerCreators[key as keyof typeof controllerCreators]
      if (controllerCreator) {
        this.createElement(key, positionCode, ($el: HTMLElement) => {
          controllerCreator.call(this, $el)
        })
      }
    }
  }

  createElement(
    name: string,
    positionCode: keyof typeof EControllersPosition,
    elementCallback: (el: HTMLElement) => void
  ) {
    const $controllerDiv = document.createElement("div")

    $controllerDiv.classList.add("mapyna-controller")
    $controllerDiv.classList.add(`mapyna-controller-${name}`)

    elementCallback($controllerDiv)

    // Append the new div as a child to the parent div
    this.root.$container.appendChild($controllerDiv)

    this.setControllerPosition($controllerDiv, positionCode)

    this.$controllers[name] = $controllerDiv
  }
  createZoomController($element: HTMLElement) {
    const self = this

    const $zoomContainer = document.createElement("div")
    $zoomContainer.classList.add("mapyna-controller-container")

    //Zoom In Button
    const $zoomInButton = document.createElement("div")
    $zoomInButton.classList.add("mapyna-zoom-in-button")

    $zoomInButton.appendChild(
      this.createIconElement(config.assets.controllers.plus)
    )
    $zoomInButton.addEventListener("click", () => {
      self.handleZoomInClick.call(self)
    })

    const $zoomOutButton = document.createElement("div")
    $zoomOutButton.classList.add("mapyna-zoom-out-button")
    $zoomOutButton.appendChild(
      this.createIconElement(config.assets.controllers.minus)
    )
    $zoomOutButton.addEventListener("click", () => {
      self.handleZoomOutClick.call(self)
    })

    $zoomContainer.appendChild($zoomInButton)
    $zoomContainer.appendChild($zoomOutButton)

    $element.appendChild($zoomContainer)
  }

  createIconElement(icon: string) {
    const $icon = document.createElement("div")
    $icon.classList.add("mapyna-controller-icon")
    $icon.innerHTML = icon
    return $icon
  }

  createDrawController($element: HTMLElement) {
    this.createButtonIconController(
      $element,
      config.assets.controllers.draw,
      () => {
        if (this.drawingEnabled) {
          this.disableControllerButton.call(this, "draw", "stroke")
          this.drawing?.destroy()
          this.drawing?.hideDrawingModes()
        } else {
          this.enableControllerButton.call(this, "draw", "stroke")
          this.drawing?.init()
          this.drawing?.showDrawingModes()
        }

        this.drawingEnabled = !this.drawingEnabled
        this.root.drawingEnabled = !this.drawingEnabled
      }
    )

    this.drawing?.createDrawingModes()
  }

  createLayersController($element: HTMLElement, positionCode: string) {
    const isEnabled = Object.values(this.root.config.layers).some(
      (value) => value.enabled
    )
    if (!isEnabled) {
      return
    }

    this.createButtonIconController(
      $element,
      config.assets.controllers.layers,
      () => {
        this.root.layersObject?.togglePopup.call(this.root.layersObject)
      }
    )

    setTimeout(() => {
      this.root.layersObject?.createPopup($element, positionCode)
    })
  }

  enableControllerButton(key: string, type: "stroke" | "fill") {
    const className = ".mapyna-controller-button"
    const $button = this.$controllers[key].querySelector(
      className
    ) as HTMLElement

    const $icon = $button?.querySelector("svg")

    $button.style.background = this.buttonStyle.activeColor
    $button.style.borderColor = this.buttonStyle.activeColor

    if (type === "stroke" && $icon) {
      $icon.style.stroke = "#FFFFFF"
    }

    if (type === "fill" && $icon) {
      $icon.style.fill = "#FFFFFF"
    }
  }

  disableControllerButton(key: string, type: "stroke" | "fill") {
    const className = ".mapyna-controller-button"
    const $button = this.$controllers[key].querySelector(
      className
    ) as HTMLElement

    const $icon = $button.querySelector("svg")

    $button.style.background = this.buttonStyle.background
    $button.style.border = this.buttonStyle.border

    if (type === "stroke" && $icon) {
      $icon.style.stroke = "#000000"
    }

    if (type === "fill" && $icon) {
      $icon.style.fill = "#000000"
    }
  }

  createViewController($element: HTMLElement) {
    const icon =
      this.root.mapView === "map"
        ? config.assets.controllers.satelliteView
        : config.assets.controllers.mapView

    this.createButtonIconController($element, icon, (_, $icon) => {
      if (this.root.mapView === "map") {
        $icon.innerHTML = config.assets.controllers.mapView
        this.handleViewClick.call(this)
      } else {
        $icon.innerHTML = config.assets.controllers.satelliteView
        this.handleViewClick.call(this)
      }
    })
  }

  createButtonIconController(
    $element: HTMLElement,
    icon: string,
    handleClick: ($button: HTMLElement, $icon: HTMLElement) => void
  ) {
    const $controllerButton = document.createElement("button")
    $controllerButton.classList.add("mapyna-controller-button")

    const $controllerIcon = this.createIconElement(icon)

    $controllerButton.appendChild($controllerIcon)

    $controllerButton.addEventListener("click", () =>
      handleClick($controllerButton, $controllerIcon)
    )

    $element.appendChild($controllerButton)

    return $controllerButton
  }

  setControllerPosition($el: HTMLElement, code: string) {
    this.root.setElementPosition($el, code, this.root.config.controllerSpace)
  }

  updateBadge(name: string, number: number) {
    if (!Object.prototype.hasOwnProperty.call(this.$controllers, name)) {
      return
    }

    const $button = this.$controllers[name].querySelector(
      ".mapyna-controller-button"
    ) as HTMLElement

    if (number > 0) {
      if (Object.prototype.hasOwnProperty.call(this.$badges, name)) {
        this.$badges[name].innerHTML = `<span>${number}</span>`
      } else {
        const $badge = document.createElement("div")
        $badge.classList.add("mapyna-controller-badge")
        $badge.innerHTML = `<span>${number}</span>`

        $button.appendChild($badge)
        this.$badges[name] = $badge
      }
    } else if (Object.prototype.hasOwnProperty.call(this.$badges, name)) {
      $button.removeChild(this.$badges[name])
      delete this.$badges[name]
    }
  }

  // should override by the child classes
  handleZoomInClick() {}

  // should override by the child classes
  handleZoomOutClick() {}

  // should override by the child classes
  setDrawingInstance() {}

  // should override by the child classes
  handleViewClick() {
    if (this.root.mapView === "satellite") {
      this.root.mapView = "map"
    } else {
      this.root.mapView = "satellite"
    }
  }
}
