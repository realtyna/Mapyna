import type { MarkerClustererOptions } from "@googlemaps/markerclusterer"
import type { LatLngLiteral, MarkerClusterGroupOptions } from "leaflet"

export type TMapynaConfig = {
  /**
   * The ID of the HTML element where the map will be rendered.
   * @default "mapyna"
   */
  elementId: string

  /**
   * The Map ID of the Google Map if using Google Maps.
   * This is required for advanced marker functionality.
   * @see https://developers.google.com/maps/documentation/get-map-id
   */
  gMapId: string | null

  /**
   * An Object contains URLs of external scripts required for the library
   */
  scripts: {
    /**
     * URL of the Google Maps MarkerClusterer library
     * @default
     * @see https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js
     */
    googleMapMarkerClustererScriptSource: string

    /**
     * URL of the Google Maps MarkerSpiderfier library
     * @default
     * @see https://cdnjs.cloudflare.com/ajax/libs/OverlappingMarkerSpiderfier/1.0.3/oms.min.js
     */
    googleMapMarkerSpiderfierScriptSource: string

    /**
     * URL of the Leaflet MarkerClusterer library
     * @default
     * @see https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js
     */
    leafletMarkerClustererScriptSource: string

    /**
     * URL of the CSS file for the Leaflet MarkerClusterer
     * @default
     * @see https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css
     */
    leafletMarkerClustererStyleSource: string

    /**
     * URL of the CSS file for the default MarkerClusterer style
     * @default
     * @see https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css
     */
    leafletMarkerClustererDefaultStyleSource: string
  }

  /**
   * The data that will be displayed on the map
   *
   * **Note:** This is only for demo purpose
   *
   * @default null
   */
  data?: unknown

  /**
   * The default zoom level of the map. It specifies the initial zoom level when the map loads.
   *
   * **Note:** `defaultZoom` can only be set if `defaultCenter` is defined.
   *
   * @default null
   */
  defaultZoom: number | null

  /**
   * The default center coordinates of the map. It specifies the initial latitude and longitude to center the map when it loads. The value should be an object with the lat and lng properties representing the latitude and longitude, respectively. Alternatively, it can be set to null to allow the map to load based on the coordinates of the markers and the map's bounds will be automatically adjusted to fit the marker data.
   *
   * **Required if setting `defaultZoom`**
   *
   * @default null
   */
  defaultCenter:
    | {
        lat: number
        lng: number
      }
    | LatLngLiteral
    | google.maps.LatLng
    | null

  /**
   * The default view of the map. It specifies the initial view of the map when it loads. The value can be either 'map' or 'satellite'.
   * @default 'map'
   */
  defaultView: "map" | "satellite"

  /**
   * Determines whether the scroll wheel zoom functionality is enabled.
   * @default true
   */
  scrollWheel: boolean

  /**
   * The key in the data source representing the latitude of each marker
   * @default 'lat'
   */
  latitudeKey: string

  /**
   * The key in the data source representing the longitude of each marker
   * @default 'lng'
   */
  longitudeKey: string

  /**
   * The key in the data source representing the unique identifier of each marker
   * @default 'id'
   */
  idKey: string

  /**
   * The key in the data source representing the price of each marker
   * @default 'price'
   */
  priceKey: string

  /**
   * A function that renders the price marker
   *
   * @param price The price of the marker
   *
   * @return The customized price for the marker
   * 
   * @example 
   * return Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
      }).format(price)
   */
  priceRender: ((price: number) => string) | null

  /**
   * An array of marker styles
   */
  markerStyles: TMapynaMarkerStyle[]

  /**
   * Allows to customize the positions of various controls in your application
   * @default
   * {
   * zoomX: EControllersPosition.TOP_RIGHT,
   * view: EControllersPosition.TOP_RIGHT,
   * draw: EControllersPosition.RIGHT_TOP,
   * layers: EControllersPosition.RIGHT_TOP
   * }
   */
  controllers: {
    zoomX: keyof typeof EControllersPosition
    view: keyof typeof EControllersPosition
    draw: keyof typeof EControllersPosition
    layers: keyof typeof EControllersPosition
  }

  /**
   * The spacing between map controllers
   * @default 7
   */
  controllerSpace: number

  /**
   * Determines whether the freehand drawing mode creates closed shapes (polygons) during the drawing process. By default, the closedFreehand option is set to false, indicating that the shapes are open (polylines) during the drawing process
   * @default false
   */
  closedFreehand: boolean

  /**
   * Determines whether the map zooms to the drawn shape after drawing is completed.
   * @default false
   */
  zoomAfterDrawing: boolean

  /**
   * Configuration for the drawn shape
   * @default
   *  style: {
        strokeColor: "#e74c3c",
        strokeOpacity: 0.9,
        strokeWeight: 4,
        fillColor: "transparent",
        fillOpacity: 0
      },
      payload: null
   */
  drawing: {
    /**
     * The style options for the drawn shape.
     */
    style: {
      strokeColor: string
      strokeOpacity: number
      strokeWeight: number
      fillColor: string
      fillOpacity: number
    }
    /**
     * The initial payload of the drawn shape
     * @todo need to be implemented
     */
    payload: any
  }

  /**
   * Configuration for showing custom messages on the map
   */
  notify: TMapynaNotify

  /**
   * Configuration for marker clustering
   */
  clustering: {
    /**
     * Determines whether marker clustering is enabled
     *
     * @default false
     */
    enabled: boolean

    /**
     * The configuration options will be passed to MarkerClusterer
     * @see https://googlemaps.github.io/js-markerclusterer/interfaces/MarkerClustererOptions.html
     */
    googleMapOptions: Omit<MarkerClustererOptions, "markers" | "map">

    /**
     * The configuration options will be passed to Leaflet.markercluster
     * @see https://github.com/Leaflet/Leaflet.markercluster
     */
    leafletOptions: MarkerClusterGroupOptions
  }

  /**
   * Configuration for info windows
   *
   * **Note:** To populate the content of the info window, you can use either the `dataKey` option or the `render` function. Only one of them should be filled, and if both are provided, the render function takes priority **
   */

  infoWindow: TInfoWindow

  /**
   * Configuration for loading indicator
   */
  loading: {
    /**
     * The class name of the loading indicator
     * @default 'mapyna-loading'
     */
    className: string
    /**
     * The position of the loading indicator
     * @default 'LEFT_TOP'
     */
    position: keyof typeof EControllersPosition
    /**
     * The spacing between the loading indicator and the map
     * @default 7
     */
    space: number
  }
  /**
   * The option allows to configure different layers for the map. Each layer can have its own settings, including the layer type, visibility, label, zoom level, and fetch callback
   */
  layers: {
    [key: string]: any
    schools?: Partial<TMapynaLayer>
    zipcodes?: Partial<Omit<TMapynaLayer, "markerStyles">>
    neighbourhoods?: Partial<Omit<TMapynaLayer, "markerStyles">>
  }

  /**
   * Determines whether RealityFeed integration is enabled
   *
   * @default false
   */
  rfEnabled: boolean

  /**
   * Configuration options for RealityFeed integration
   */
  rfIntegration: {
    /**
     * The base URL of the RealityFeed API
     *
     * @default "https://api.realityfeed.com"
     */
    apiBase?: string

    /**
     * The authentication token for the RealityFeed API
     *
     * **Note:** If the token is not provided, the map will not be able to fetch the data from the API
     *
     * @default null
     */
    token: (() => Promise<string> | null) | Promise<string> | null
    /**
     * Allows to override specific layer options with the RF data. When the rfEnabled option is set to true, the layer options specified within the layers property will override the corresponding options in the main layers option of the library config
     */
    layers?: {
      [key: string]: any
      schools?: Partial<
        Pick<
          TMapynaLayer,
          "latitudeKey" | "longitudeKey" | "idKey" | "infoWindow"
        >
      >
      zipcodes?: Partial<
        Pick<
          TMapynaLayer,
          "latitudeKey" | "longitudeKey" | "idKey" | "infoWindow"
        >
      >
      neighbourhoods?: Partial<
        Pick<
          TMapynaLayer,
          "latitudeKey" | "longitudeKey" | "idKey" | "infoWindow"
        >
      >
    }
  }
}

export type TMapynaMarkerStylePrice = Pick<
  TMapynaMarkerStyleBase,
  | "size"
  | "textColor"
  | "fillColor"
  | "fontWeight"
  | "fontSize"
  | "stroke"
  | "strokeColor"
  | "conditions"
  | "opacity"
> & {
  type: "price"
}

export type TMapynaMarkerStyleCustom = Pick<
  TMapynaMarkerStyleBase,
  "svg" | "size" | "conditions" | "opacity"
> & {
  type: "custom"
}

export type TMapynaMarkerStyleOther = Pick<
  TMapynaMarkerStyleBase,
  "stroke" | "strokeColor" | "fillColor" | "size" | "conditions" | "opacity"
> & {
  type: "pin" | "circle"
}

export type TMapynaMarkerStyleBase = {
  /**
   * The opacity of the marker's fill
   */
  opacity: number

  /**
   * The color of the marker's text
   *
   * **Note:** applicable only for type `price`
   */
  textColor: string

  /**
   * The font size of the marker's text
   *
   * **Note:** applicable only for type `price`
   */
  fontSize: number

  /**
   * The font weight of the marker's text
   *
   * **Note:** applicable only for type `price`
   */
  fontWeight:
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900"

  /**
   * Custom SVG.  applicable for `custom` type only
   */
  svg: string

  /**
   * The stroke width of the marker's border. Not applicable for 'custom' type
   */
  stroke: number

  /**
   * The stroke color of the marker's border. Not applicable for 'custom' type
   */
  strokeColor: string

  /**
   *  The size of the marker. Not applicable for `custom` type
   */
  size?: number

  /**
   * The color of the marker's fill. Not applicable for 'custom' type
   */
  fillColor: string

  /**
   * An array of conditions for applying the marker style based on certain criteria. Each * condition is an object and consists of the following properties:
   *
   * `key (string):` The key representing the data field to be evaluated.
   *
   * `value (any):` The value to compare against the data field.
   *
   * `operator (string, optional):` The comparison operator to be used
   * Possible operators are: `>, >=, =, <=, <`
   *
   * @default '='
   */
  conditions?: TMapynaMarkerStyleCondition[]
}

export type TMapynaMarkerStyle =
  | TMapynaMarkerStylePrice
  | TMapynaMarkerStyleCustom
  | TMapynaMarkerStyleOther

export type TMapynaMarkerStyleCondition = {
  key: string
  value: string
  operator: ">" | ">=" | "=" | "<=" | "<"
}

export const EControllersPosition = {
  TOP_RIGHT: "TOP_RIGHT",
  RIGHT_TOP: "RIGHT_TOP",
  RIGHT_BOTTOM: "RIGHT_BOTTOM",
  BOTTOM_RIGHT: "BOTTOM_RIGHT",
  TOP_LEFT: "TOP_LEFT",
  LEFT_TOP: "LEFT_TOP",
  LEFT_BOTTOM: "LEFT_BOTTOM",
  BOTTOM_LEFT: "BOTTOM_LEFT",
  BOTTOM_CENTER: "BOTTOM_CENTER",
  TOP_CENTER: "TOP_CENTER"
} as const

export type TMapynaLayer = {
  /**
   * The type of the layer
   *
   * `point`: Represents a layer with point markers.
   *
   * **Note:** Requires additional properties such as `idKey`, `latitudeKey`, `longitudeKey`, and `markerStyles`
   *
   * `zone`: Represents a layer with zone or polygon shapes
   */
  type: "point" | "zone"

  /**
   * The name of the layer
   */
  name: string

  /**
   * Determines whether the layer is enabled or not
   */
  enabled: boolean

  /**
   * Specifies the label or name of the layer
   */
  label: string

  /**
   *  Sets the minimum zoom level at which the layer should be loaded and displayed on the map
   */
  minZoom: number

  /**
   * The key in the data source representing the unique identifier for each point
   *
   * **Required if type is `point`**
   */
  idKey?: string

  /**
   * The key in the data source representing the latitude value for each point.
   *
   * **Required if type is `point`**
   */
  latitudeKey: string

  /**
   * The key in the data source representing the longitude value for each point.
   *
   * **Required if type is `point`**
   */
  longitudeKey: string

  /**
   * Allows customization of the marker appearance. Includes properties such as `type`, `size`, `svg`, and `opacity`
   *
   * **Required if type is `point`**
   */
  markerStyles: TMapynaMarkerStyle

  /**
   * The info window configuration
   */
  infoWindow?: TInfoWindow

  /**
   * The optional fetch callback function
   * @param {TBoundingBox} data - The data object representing the data source associated with the layer
   * @return {Promise<TLayerCallbackResponse[]> | null}
   */
  fetchCallback?: (
    data: TBoundingBox
  ) => Promise<TLayerCallbackResponse[]> | null
}

export type TBoundingBox = {
  northEast: { lat: number; lng: number }
  northWest: { lat: number; lng: number }
  southEast: { lat: number; lng: number }
  southWest: { lat: number; lng: number }
}

export type TLayerCallbackResponse = {
  id: string
  type: string
  properties: TLayerCallbackProperties
  geometry: TLayerCallbackGeometry
}

export type TLayerCallbackProperties = {
  OBJECTID: number
  POPULATION: number
  POP_SQMI: number
  PO_NAME: string
  SQMI: number
  STATE: string
  Shape__Area: number
  Shape__Length: number
  ZIP_CODE: number
}
export type TLayerCallbackGeometry = {
  type: string
  coordinates:
    | [number, number][][]
    | {
        lat: number
        lng: number
      }[][]
}

type TInfoWindowBase = {
  enabled: boolean

  /**
   * Defines the event that triggers the display of the info window.
   * Possible values:
   * - `click`: The info window is displayed when the user clicks on a marker.
   * - `mouseover`: The info window is displayed when the user hovers over a marker.
   */
  trigger: "click" | "mouseover"

  /**
   * Controls whether the content of the info window should be cached.
   * If set to true, the content of the info window will be cached,
   * and the render function or the corresponding dataKey value
   * in the data source will only be executed once for each unique
   * data point. Subsequent invocations will retrieve the content
   * from the cache, improving performance
   * @default true
   */
  caching: boolean
}

type TInfoWindowWithRender = {
  /**
   * Allows you to define a custom rendering function for the content of the info window. This function will be responsible for generating the HTML or content structure for the info window. If render is provided, it will take precedence over the dataKey option
   * @example
   * render: (data) => {
      const html = `
          <div>
             <strong>${data.NAME}</strong>
          </div>
      `;
      return html;
    }
   * 
   *
   * @param {any} data - The data object representing the data
   *                    source associated with the marker.
   * @return {string | Promise<string>} The HTML string representing the content
   *                  of the info window.
   */
  render: (data: any) => Promise<string>

  dataKey?: never
} & TInfoWindowBase

type TInfoWindowWithoutRender = {
  render?: never

  /**
   * Specifies the key in the data source that represents the content of the info window. The value of the corresponding key in the data source will be used as the content for the info window.
   */
  dataKey: string
} & TInfoWindowBase

export type TInfoWindow = TInfoWindowWithRender | TInfoWindowWithoutRender

export type TMapynaNotify = {
  /**
   * @default "TOP_LEFT"
   */
  position: keyof typeof EControllersPosition

  /**
   * Specifies the spacing between multiple messages.
   * @default 5
   */
  space: number

  /**
   * Specifies the duration (in milliseconds) before a message automatically closes
   * @default 4000
   */
  duration: number

  /**
   * Optional callback function triggered when a message is closed
   */
  onClose?: () => void

  /**
   * Visual style of the notification message
   * @default "default"
   */
  style: "success" | "info" | "warning" | "error" | "default"

  /**
   * Controls whether messages persist on the screen until manually closed
   * @default false
   */
  persist: boolean
}
