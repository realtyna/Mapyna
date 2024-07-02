import type { MapynaGoogleMap } from "../MapynaGoogleMap"
import type { MapynaLeaflet } from "../MapynaLeaflet"
import config from "../config"
import type { TMapynaMarkerStyle } from "../types/config.type"

export class MapynaMarkerStyle {
  root: MapynaGoogleMap | MapynaLeaflet
  styles: TMapynaMarkerStyle[] | TMapynaMarkerStyle
  pointData: Record<string, any>
  style:
    | (TMapynaMarkerStyle & {
        text?: string
      })
    | null
  anchor: Record<string, any>
  $element: HTMLElement | null

  constructor(
    root: MapynaGoogleMap | MapynaLeaflet,
    pointData: Record<string, any>,
    styles: TMapynaMarkerStyle[] | TMapynaMarkerStyle | null = null
  ) {
    this.root = root
    this.styles = styles ? styles : this.root.config.markerStyles!
    if (styles) {
      this.styles = styles
    }
    this.styles = Array.isArray(this.styles) ? this.styles : [this.styles]
    this.pointData = pointData
    this.style = this.getStyle()!
    this.anchor = this.getAnchor()
    if (this.style?.type && typeof this[this.style.type] !== "function") {
      this.style = null
    }
    if (this.style?.type === "price") {
      const priceValue = this.pointData[this.root.config.priceKey]
      if (typeof this.root.config.priceRender === "function") {
        this.style.text = this.root.config.priceRender(priceValue)
      } else {
        this.style.text = priceValue
      }
    }
    this.$element = null
    this.createElement()
  }

  getStyle() {
    let matchingStyle
    if (Array.isArray(this.styles)) {
      matchingStyle = this.styles?.find((style) => {
        if (!style.conditions) {
          return true
        }

        return style.conditions.every((condition) => {
          const key = condition.key
          const value = condition.value
          const operator = condition.operator || "="

          switch (operator) {
            case ">":
              return this.pointData[key] > Number(value)
            case ">=":
              return this.pointData[key] >= Number(value)
            case "=":
              return this.pointData[key] === value
            case "<":
              return this.pointData[key] < Number(value)
            case "<=":
              return this.pointData[key] <= Number(value)
            default:
              return false
          }
        })
      })
    }

    if (!matchingStyle && Array.isArray(this.styles)) {
      matchingStyle = this.styles?.[0]
    }

    return matchingStyle
  }

  createElement() {
    this.$element = document.createElement("div")
    this.$element.classList.add("mapyna-marker")

    this.$element.style.position = "relative"

    const $elementIcon = document.createElement("div")
    $elementIcon.classList.add("mapyna-marker-icon")

    $elementIcon.style.position = "absolute"

    if (this.style?.size) {
      $elementIcon.style.width = this.style.size + "px"
      $elementIcon.style.height = this.style.size + "px"
    }

    if (this.anchor.top) {
      $elementIcon.style.top = this.anchor.top
    }

    if (this.anchor.bottom) {
      $elementIcon.style.bottom = this.anchor.bottom
    }

    if (this.anchor.left) {
      $elementIcon.style.left = this.anchor.left
    }

    if (this.anchor.right) {
      $elementIcon.style.right = this.anchor.right
    }

    if (this.anchor.transform) {
      $elementIcon.style.transform = this.anchor.transform
    }

    /*$elementIcon.style.top = '-' + this.anchor.y + 'px';
        $elementIcon.style.left = '-' + this.anchor.x + 'px';*/

    if (this.style && $elementIcon) {
      const $icon = this[this.style.type]($elementIcon) as HTMLElement
      this.$element.appendChild($icon)
    }
  }

  getAnchor() {
    /*if (this.style.anchor) {
            return this.style.anchor
        }*/

    if (this.style?.type === "price") {
      return {
        bottom: "0",
        left: "50%",
        transform: "translateX(-50%)"
      }
    } else if (this.style?.type === "pin") {
      return {
        bottom: "0",
        left: "50%",
        transform: "translateX(-50%)"
      }
    } else {
      return {
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)"
      }
    }
  }

  circle($icon: HTMLElement) {
    if (this.style?.type !== "circle") return
    $icon.style.backgroundColor = this.style?.fillColor
    $icon.style.opacity = this.style?.opacity.toString()
    $icon.style.borderRadius = "50%"
    $icon.style.borderWidth = this.style?.stroke + "px"
    $icon.style.borderStyle = "solid"
    $icon.style.borderColor = this.style?.strokeColor

    return $icon
  }

  custom($icon: HTMLElement) {
    if (this.style?.type !== "custom") return
    $icon.innerHTML = this.style?.svg

    return $icon
  }

  pin($icon: HTMLElement) {
    if (this.style?.type !== "pin") return
    const path = config.markerIcons["pin"].path
    const viewBox = config.markerIcons["pin"].viewBox || null
    const viewBoxAttr = viewBox ? 'viewBox="' + viewBox + '"' : ""
    const color = this.style.fillColor
    const strokeColor = this.style.strokeColor
    const stroke = this.style.stroke
    const size = this.style.size
    $icon.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" ' +
      viewBoxAttr +
      ' fill="' +
      color +
      '" stroke-width="' +
      stroke +
      '" stroke="' +
      strokeColor +
      '" width="' +
      size +
      '" height="' +
      size +
      '"><path d="' +
      path +
      '"/></svg>'
    return $icon
  }

  price($icon: HTMLElement) {
    if (this.style?.type !== "price") return
    $icon.style.backgroundColor = this.style.fillColor
    $icon.style.color = this.style.textColor
    $icon.style.opacity = this.style.opacity.toString()
    $icon.style.borderRadius = "10px"
    $icon.style.padding = "2px 5px"
    $icon.style.borderWidth = this.style.stroke + "px"
    $icon.style.borderStyle = "solid"
    $icon.style.borderColor = this.style.strokeColor
    $icon.style.fontSize = this.style.fontSize + "px"
    $icon.style.fontWeight = this.style.fontWeight

    $icon.innerText = this.style.text ? this.style.text : ""

    // Create triangle element
    const $triangle = document.createElement("div")
    $triangle.style.position = "absolute"
    $triangle.style.bottom = "-5px"
    $triangle.style.left = "50%"
    $triangle.style.transform = "translateX(-50%)"
    $triangle.style.borderLeft = "5px solid transparent"
    $triangle.style.borderRight = "5px solid transparent"
    $triangle.style.borderTop = `5px solid ${this.style.strokeColor}`

    // Append the triangle element to the main element
    $icon.appendChild($triangle)

    return $icon
  }
}
