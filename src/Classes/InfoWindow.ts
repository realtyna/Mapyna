import makeCancellablePromise from "make-cancellable-promise"
import type { MapynaGoogleMap } from "../MapynaGoogleMap"
import type { MapynaLeaflet } from "../MapynaLeaflet"
import type { TInfoWindow } from "../types/config.type"

export abstract class MapynaInfoWindow {
  root: MapynaGoogleMap | MapynaLeaflet
  options: TInfoWindow | null
  $infoWindow: HTMLDivElement | null
  infoWindowIsShown: boolean
  infoWindowDisabled: boolean
  infoWindowTimeout: number | null
  $loading: HTMLDivElement | null
  cancelablePromise: (() => void) | null
  cachData: Record<string, string> | null

  constructor(root: MapynaGoogleMap | MapynaLeaflet, options = {}) {
    this.root = root
    this.options = { ...root.config.infoWindow, ...options }
    this.$infoWindow = null
    this.infoWindowIsShown = false
    this.infoWindowDisabled = false
    this.infoWindowTimeout = null
    this.$loading = null
    this.cancelablePromise = null
    this.cachData = {}

    this.init()
  }

  init() {
    this.$infoWindow = document.createElement("div")
    this.$infoWindow.classList.add("mapyna-infowindow")
    this.$infoWindow.style.zIndex = "5000"
    this.root.$container.appendChild(this.$infoWindow)

    this.$loading = this.createLoading()
  }

  disable() {
    this.infoWindowDisabled = true
  }

  enable() {
    this.infoWindowDisabled = false
  }

  updatePosition(markerPosition: L.Point | google.maps.Point) {
    const mapHeight = this.root.$container.offsetHeight
    const mapWidth = this.root.$container.offsetWidth

    const iwHeight = this.$infoWindow?.offsetHeight || 0
    const iwWidth = this.$infoWindow?.offsetWidth || 0

    let positionLeft
    let positionTop

    if (markerPosition.x < mapWidth / 2) {
      positionLeft = markerPosition.x + 30
    } else {
      positionLeft = markerPosition.x - iwWidth - 15
    }

    if (mapHeight - markerPosition.y < iwHeight / 2 + 30) {
      positionTop = mapHeight - iwHeight - 30
    } else if (markerPosition.y < iwHeight / 2 + 30) {
      positionTop = 30
    } else {
      positionTop = markerPosition.y - iwHeight / 2
    }

    if (this.$infoWindow) {
      this.$infoWindow.style.top = positionTop + "px"
      this.$infoWindow.style.left = positionLeft + "px"
    }
  }

  createLoading() {
    const $loading = document.createElement("div")
    $loading.classList.add("mapyna-infowindow-card")
    $loading.innerHTML = '<div class="mapyna-infowindow-loading"></div>'

    return $loading
  }

  showLoading() {
    if (!this.$infoWindow) {
      return
    }
    this.$infoWindow.innerHTML = this.$loading?.outerHTML || ""
  }

  async renderWithCancellation(pointData: Record<string, string>) {
    if (this.options?.render) {
      if (this.cancelablePromise) {
        this.cancelablePromise()
        this.cancelablePromise = null
      }

      const { promise, cancel } = makeCancellablePromise(
        this.options.render(pointData) as Promise<string>
      )

      this.cancelablePromise = cancel

      return promise.then((html) => html)
    }
  }

  async show(
    $marker: L.Marker | google.maps.marker.AdvancedMarkerElement,
    pointData: Record<string, string>
  ) {
    if (this.infoWindowDisabled) {
      return
    }

    this.hide()

    if (this.root.map && this.root.map instanceof google.maps.Map) {
      this.root.map.addListener("click", () => this.hide())
    } else if (this.root.map && this.root.map instanceof L.Map) {
      this.root.map.on("click", () => this.hide())
    }

    this.showLoading()

    if (!this.$infoWindow) {
      return
    }

    this.$infoWindow.style.display = ""

    const markerPosition = this.root.getMarkerPixelPosition($marker as any)

    if (markerPosition) {
      this.updatePosition(markerPosition)
    }

    const pointId = pointData[this.root.config.idKey]

    let html: string | undefined | null = null

    if (
      this.cachData &&
      this.options &&
      this.options.caching &&
      pointId in this.cachData
    ) {
      html = this.cachData[pointId]
    } else {
      if (this.options && typeof this.options.render === "function") {
        html = await this.renderWithCancellation(pointData)
      } else if (this.options && this.options.dataKey) {
        html = pointData[this.options.dataKey]
      }

      if (this.options && this.options.caching && this.cachData && html) {
        this.cachData[pointId] = html
      }
    }

    this.$infoWindow.innerHTML = html || ""

    if (markerPosition) {
      this.updatePosition(markerPosition)
    }

    this.infoWindowIsShown = true

    this.createSlider()
  }

  hide() {
    if (this.infoWindowIsShown && this.$infoWindow) {
      this.$infoWindow.style.display = "none"
      this.infoWindowIsShown = false
    }
  }

  createSlider() {
    const $sliderContainer = document.querySelector(
      "*[data-mapyna-infowindow-slider]"
    )

    if (!$sliderContainer) {
      return
    }

    const images = $sliderContainer.getElementsByTagName("img")

    const $nextButton = document.querySelector(
      ".mapyna-infowindow-gallery-next"
    ) as HTMLDivElement
    const $prevButton = document.querySelector(
      ".mapyna-infowindow-gallery-prev"
    ) as HTMLDivElement

    if (images.length < 2) {
      if ($nextButton && $prevButton) {
        $nextButton.style.display = "none"
        $prevButton.style.display = "none"
      }
      return
    }

    if ($nextButton) {
      $nextButton.addEventListener("click", (e) => {
        e.preventDefault()
        const slideWidth = $sliderContainer.clientWidth
        $sliderContainer.scrollLeft += slideWidth
      })
    }

    if ($prevButton) {
      $prevButton.addEventListener("click", (e) => {
        e.preventDefault()
        const slideWidth = $sliderContainer.clientWidth
        $sliderContainer.scrollLeft -= slideWidth
      })
    }
  }

  linkToPointer(
    $marker: L.Marker | google.maps.marker.AdvancedMarkerElement,
    pointData: Record<string, any>
  ) {
    if (!this.options || !this.options.enabled) {
      return null
    }

    const showInfoWindow = async () => {
      await this.show($marker, pointData)
    }

    return { showInfoWindow }
  }
}
