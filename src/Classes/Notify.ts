import config from "../config"
import type { TMapynaNotify } from "../types/config.type"
import type { MapynaMap } from "./Map"

export class MapynaNotify {
  root: MapynaMap<google.maps.Map | L.Map>
  config: TMapynaNotify
  $container: HTMLElement | undefined
  $notify: HTMLElement | undefined
  messages: {
    [key: number]: HTMLDivElement
  }
  timeouts: any

  constructor(root: MapynaMap<google.maps.Map | L.Map>) {
    this.root = root
    this.config = this.root.config.notify!
    this.messages = {}
    this.timeouts = {}
    this.init()
  }

  init() {
    this.createContainer()
  }

  createContainer() {
    // Create a new div element
    this.$container = document.createElement("div")
    this.$container.classList.add("mapyna-notify-container")
    this.$container.style.display = "none"

    this.$notify = document.createElement("div")

    // Assign a class to the new div
    this.$notify.classList.add("mapyna-notify")

    // Append the new div as a child to the parent div
    this.$container.appendChild(this.$notify)
    this.root.$container.appendChild(this.$container)

    this.setNotifyPosition(this.$container)
  }

  createNotifyMessage(message: string, options: Record<string, any>) {
    const style = "style" in options ? options.style : "default"
    const notifyId = this.generateId()

    // Create a new div element
    const $notifyMessage = document.createElement("div")
    $notifyMessage.classList.add("mapyna-notify-message")
    $notifyMessage.classList.add("mapyna-notify-" + style)

    $notifyMessage.innerHTML = message

    // Add Close Icon
    const $closeIcon = document.createElement("div")
    $closeIcon.classList.add("mapyna-notify-close")
    $closeIcon.innerHTML = config.assets.settings.close

    const self = this
    $closeIcon.addEventListener("click", function () {
      self.removeNotifyMessage(notifyId)
      if (typeof options.onClose === "function") {
        options.onClose()
      }
    })

    $notifyMessage.appendChild($closeIcon)

    // Append the new div as a child to the parent div
    this.$notify?.prepend($notifyMessage)

    this.messages[notifyId] = $notifyMessage

    if (this.$container) {
      this.$container.style.display = ""
    }

    return notifyId
  }

  removeNotifyMessage(notifyId: number) {
    this.$notify?.removeChild(this.messages[notifyId])
    delete this.messages[notifyId]

    if (Object.keys(this.messages).length === 0) {
      if (this.$container) {
        this.$container.style.display = "none"
      }
    }

    if (notifyId in this.timeouts) {
      clearTimeout(this.timeouts[notifyId])
      delete this.timeouts[notifyId]
    }
  }

  setNotifyPosition($el: any) {
    this.root.setElementPosition($el, this.config.position!, this.config.space)
  }

  show(message: string, options: Record<string, any> = {}) {
    const persist = "persist" in options ? options.persist : false

    const notifyId = this.createNotifyMessage(message, options)

    if (!persist) {
      this.timeouts[notifyId] = setTimeout(() => {
        this.removeNotifyMessage(notifyId)
        if (typeof options.onClose === "function") {
          options.onClose()
        }
      }, this.config.duration || 2000)
    }

    return notifyId
  }

  hide(notifyId: number) {
    this.removeNotifyMessage(notifyId)
  }

  generateId() {
    return new Date().getTime() / 1000
  }
}
