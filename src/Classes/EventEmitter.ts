class MapynaEventEmitter {
  events: Record<string, Array<(...args: any[]) => void>>

  constructor() {
    this.events = {}
  }

  emit(eventName: string, ...args: any[]) {
    const eventHandlers = this.events[eventName]

    if (eventHandlers) {
      eventHandlers.forEach((handler) => {
        handler(...args)
      })
    }
  }

  on(eventName: string, handler: (...args: any[]) => void) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }

    this.events[eventName].push(handler)
  }

  off(eventName: string, handler: (...args: any[]) => void) {
    const eventHandlers = this.events[eventName]

    if (eventHandlers) {
      this.events[eventName] = eventHandlers.filter((h) => h !== handler)
    }
  }
}

const eventEmitter = new MapynaEventEmitter()
export default eventEmitter
