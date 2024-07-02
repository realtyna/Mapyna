import type { TMapynaConfig } from "./types/config.type"

interface IConfig {
  defaults: TMapynaConfig
  markerIcons: {
    [key: string]: {
      path: string
      viewBox: string | null
    }
  }
  assets: {
    controllers: {
      [key: string]: string
    }
    drawing: {
      [key: string]: string
    }
    settings: {
      [key: string]: string
    }
  }
}

const assets = {
  controllers: {
    plus: '<svg width="100%" height="100%" fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 459.325 459.325" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M459.319,229.668c0,22.201-17.992,40.193-40.205,40.193H269.85v149.271c0,22.207-17.998,40.199-40.196,40.193 c-11.101,0-21.149-4.492-28.416-11.763c-7.276-7.281-11.774-17.324-11.769-28.419l-0.006-149.288H40.181 c-11.094,0-21.134-4.492-28.416-11.774c-7.264-7.264-11.759-17.312-11.759-28.413C0,207.471,17.992,189.475,40.202,189.475h149.267 V40.202C189.469,17.998,207.471,0,229.671,0c22.192,0.006,40.178,17.986,40.19,40.187v149.288h149.282 C441.339,189.487,459.308,207.471,459.319,229.668z"></path> </g> </g></svg>',
    minus:
      '<svg width="100%" height="100%" viewBox="0 -6 16 16" id="meteor-icon-kit__solid-minus-s" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 3.5H14C14.8284 3.5 15.5 2.8284 15.5 2C15.5 1.1716 14.8284 0.5 14 0.5H2C1.17157 0.5 0.5 1.1716 0.5 2C0.5 2.8284 1.17157 3.5 2 3.5z" fill="#000000"></path></g></svg>',
    satelliteView:
      '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M6.15407 7.30116C7.52877 5.59304 9.63674 4.5 12 4.5C12.365 4.5 12.7238 4.52607 13.0748 4.57644L13.7126 5.85192L11.2716 8.2929L8.6466 8.6679L7.36009 9.95441L6.15407 7.30116ZM5.2011 8.82954C4.75126 9.79256 4.5 10.8669 4.5 12C4.5 15.6945 7.17133 18.7651 10.6878 19.3856L11.0989 18.7195L8.8147 15.547L10.3741 13.5256L9.63268 13.1549L6.94027 13.6036L6.41366 11.4972L5.2011 8.82954ZM7.95559 11.4802L8.05962 11.8964L9.86722 11.5951L11.3726 12.3478L14.0824 11.9714L18.9544 14.8135C19.3063 13.9447 19.5 12.995 19.5 12C19.5 8.93729 17.6642 6.30336 15.033 5.13856L15.5377 6.1481L11.9787 9.70711L9.35371 10.0821L7.95559 11.4802ZM18.2539 16.1414C16.9774 18.0652 14.8369 19.366 12.3859 19.4902L12.9011 18.6555L10.6853 15.578L12.0853 13.7632L13.7748 13.5286L18.2539 16.1414ZM12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" fill="#080341"></path> </g></svg>',
    mapView:
      '<svg width="100%" height="100%" fill="#000000" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M 28 4.46875 L 26.59375 5.09375 L 19.96875 7.9375 L 12.34375 5.0625 L 11.96875 4.9375 L 11.59375 5.09375 L 4.59375 8.09375 L 4 8.34375 L 4 27.53125 L 5.40625 26.90625 L 12.03125 24.0625 L 19.65625 26.9375 L 20.03125 27.0625 L 20.40625 26.90625 L 27.40625 23.90625 L 28 23.65625 Z M 13 7.4375 L 19 9.6875 L 19 24.5625 L 13 22.3125 Z M 11 7.5 L 11 22.34375 L 6 24.5 L 6 9.65625 Z M 26 7.5 L 26 22.34375 L 21 24.5 L 21 9.65625 Z"></path></g></svg>',
    draw: '<svg width="100%" height="100%" viewBox="0 0 24 24" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#020202"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>.cls-1{fill:none;stroke-miterlimit:10;stroke-width:1.91px;}</style></defs><path class="cls-1" d="M17.13,22.5H9.87a2,2,0,1,1,0-4.05h1.86L5.06,11.78a2,2,0,0,1-.19-2.65A1.92,1.92,0,0,1,7.68,9l4.05,4.05L15.81,10a1.9,1.9,0,0,1,2.49.18h0a17.3,17.3,0,0,1,4.17,6.74l.06.19"></path><path class="cls-1" d="M13,1.5H8.25A1.91,1.91,0,0,0,6.34,3.41h0A1.92,1.92,0,0,0,8.25,5.32h2.86A1.9,1.9,0,0,1,13,7.23h0a1.91,1.91,0,0,1-1.91,1.91H8.29"></path></g></svg>',
    layers:
      '<svg viewBox="0 -2 24 24" id="meteor-icon-kit__regular-layer-group" fill="#000000" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.00400637 5.91007C-0.0330611 5.49869 0.189111 5.09058 0.58643 4.90998L11.1724 0.09817C11.6983 -0.14085 12.3017 -0.14085 12.8276 0.09817L23.4136 4.90998C23.8109 5.09058 24.0331 5.49869 23.996 5.91007C24.0331 6.32145 23.8109 6.72956 23.4136 6.91016L12.8276 11.722C12.3017 11.961 11.6983 11.961 11.1724 11.722L0.58643 6.91016C0.189111 6.72956 -0.0330611 6.32145 0.00400637 5.91007zM3.21935 5.91007L12 9.9013L20.7807 5.91007L12 1.91887L3.21935 5.91007zM0.58643 10.9101C0.0836585 10.6816 -0.138656 10.0887 0.0898764 9.5859C0.318409 9.0832 0.911248 8.8609 1.41402 9.0894L12 13.9012L22.586 9.0894C23.0888 8.8609 23.6816 9.0832 23.9101 9.5859C24.1387 10.0887 23.9163 10.6816 23.4136 10.9101L12.8276 15.7219C12.3017 15.9609 11.6983 15.9609 11.1724 15.7219L0.58643 10.9101zM0.58643 14.91C0.0836585 14.6815 -0.138656 14.0886 0.0898764 13.5859C0.318409 13.0831 0.911248 12.8608 1.41402 13.0893L12 17.9011L22.586 13.0893C23.0888 12.8608 23.6816 13.0831 23.9101 13.5859C24.1387 14.0886 23.9163 14.6815 23.4136 14.91L12.8276 19.7218C12.3017 19.9608 11.6983 19.9608 11.1724 19.7218L0.58643 14.91z"></path></g></svg>',
    schools:
      '<svg fill="#000000" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="School_location"> <path d="M375.8746,98.8107c-66.142-66.2787-173.6072-66.2787-239.7492,0a169.393,169.393,0,0,0-4.9005,234.5L246.3763,458.6982a13.1279,13.1279,0,0,0,19.25,0L380.7751,333.3111A169.393,169.393,0,0,0,375.8746,98.8107ZM343.5,300.0607a8.7752,8.7752,0,0,1-8.75,8.75h-52.5v-39.375a26.2056,26.2056,0,0,0-27.6492-26.1624c-14.1761.7007-24.8508,13.4753-24.8508,27.6492v37.8882h-52.5a8.7752,8.7752,0,0,1-8.75-8.75V230.1483a8.7941,8.7941,0,0,1,8.75-8.8376h35l30.625-30.625V114.7363c.2713-17.2522,25.9787-17.2586,26.25,0h43.75v48.125h-43.75v27.8244l30.625,30.625h35a8.7941,8.7941,0,0,1,8.75,8.8376Z"></path> </g> </g></svg>',
    zipcodes:
      '<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><path d="m25 2c-0.15338 0-0.30627 0.034969-0.44727 0.10547l-22 11c-0.338 0.17-0.55273 0.51553-0.55273 0.89453v2c0 0.347 0.18061 0.66856 0.47461 0.85156 0.294 0.183 0.66266 0.19797 0.97266 0.042969l21.553-10.777 21.553 10.777c0.141 0.071 0.29427 0.10547 0.44727 0.10547 0.183 0 0.36439-0.049437 0.52539-0.14844 0.294-0.183 0.47461-0.50456 0.47461-0.85156v-2c0-0.379-0.21373-0.72453-0.55273-0.89453l-22-11c-0.1405-0.0705-0.29389-0.10547-0.44727-0.10547zm0 6.3535-20.658 10.33c-0.109 0.054-0.2278 0.082047-0.3418 0.12305v28.193c0 0.552 0.448 1 1 1h40c0.552 0 1-0.448 1-1v-28.193c-0.114-0.041-0.2328-0.068047-0.3418-0.12305l-20.658-10.33zm7.1152 14.336c1.751 0 3.18 0.32262 4.168 1.2656 0.886 0.844 1.3301 2.1333 1.3301 3.5703 0 1.685-0.46842 2.8258-1.2324 3.7188-0.986 1.165-2.5871 1.7363-3.9941 1.7363-0.271 0-0.32527-3.44e-4 -0.57227-0.027344v4.0469h-2.8145v-14c0.839-0.199 1.9572-0.31055 3.1152-0.31055zm-18.488 0.31055h8.373v1.9219l-5.2441 9.6992v0.074218h5.2441v2.3047h-8.375v-1.5625l5.3887-10.07v-0.048829h-5.3867v-2.3184zm10.373 0h3v14h-3v-14zm8.5605 1.8457c-0.37 0-0.52409 0.049-0.74609 0.125v5.8008c0.198 0.049 0.20361 0.048829 0.47461 0.048828 1.724 0 2.6875-1.1886 2.6875-3.0996 0-1.561-0.64102-2.875-2.416-2.875z"/></svg>',
    neighbourhoods:
      '<svg viewBox="0 -0.5 17 17" xmlns="http://www.w3.org/2000/svg" class="si-glyph si-glyph-city"><g fill="#434343" fill-rule="evenodd"><path d="M1 8v8h3V8H1Zm2 7H1.979v-2.021H3V15Zm.021-3H1.98V9.979h1.041V12ZM10 5V3H9V0H8v3H7v2H5v11h7V5h-2ZM7 15H6v-2h1v2Zm0-2.958H6V10h1v2.042Zm0-3H6V7h1v2.042ZM9 15H8v-2h1v2Zm0-2.958H8V10h1v2.042Zm0-3H8V7h1v2.042ZM11 15h-1v-2h1v2Zm0-2.958h-1V10h1v2.042Zm0-3h-1V7h1v2.042ZM13 7v9h4v-5l-4-4Zm2.031 8.062H14v-1.094h1.031v1.094Zm0-2H14v-1.094h1.031v1.094Zm0-2H14V9.968h1.031v1.094Z" class="si-glyph-fill"/></g></svg>'
  },
  drawing: {
    freehand:
      '<svg width="100%" height="100%" fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-12.92 -12.92 348.90 348.90" xml:space="preserve" stroke="#000000" stroke-width="20.352591"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M281.442,256.312c-47.124,59.364-139.536,44.676-160.956-29.376c-1.224-3.672-1.836-7.956-2.448-11.628 c49.572-11.016,97.92-47.124,102.204-90.576c3.672-39.168-36.108-50.796-62.424-28.764 c-31.212,26.316-53.244,64.872-55.08,105.875c-31.824,4.284-63.036-4.284-80.172-35.496 c-28.764-52.631,9.792-123.624,61.2-144.432c5.508-1.836,3.06-10.404-2.448-8.568C10.326,33.544-26.394,132.688,21.954,191.439 c18.972,22.645,49.572,29.988,81.396,26.316c4.284,41.616,36.72,74.664,75.275,87.516c44.676,14.688,85.68-6.731,111.996-41.616 C294.906,258.147,285.725,251.416,281.442,256.312z M144.354,132.688c9.792-13.464,22.644-28.764,39.168-34.272 c15.911-5.508,21.42,16.524,22.031,26.316c0.612,12.24-7.956,23.256-15.912,31.824c-16.523,18.971-44.063,35.496-72.215,42.839 C119.262,175.527,130.89,152.272,144.354,132.688z"></path> <path d="M315.713,233.668c-17.136,0-34.884,1.224-51.408,5.508c-6.731,1.836-3.672,11.016,3.061,9.792 c13.464-2.448,27.54-1.836,41.004-1.224c-0.612,7.955-1.224,16.523-2.448,24.479c-1.224,6.12-5.508,15.3-1.836,21.42 c1.836,3.061,4.896,3.061,7.956,1.836c7.344-3.06,7.344-15.912,8.568-22.644c1.836-11.017,2.447-21.42,2.447-32.437 C323.057,236.728,319.385,233.668,315.713,233.668z"></path> </g> </g> </g></svg>',
    polygon:
      '<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--gis" preserveAspectRatio="xMidYMid meet" stroke="#000000" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M32.5 10.95c-6.89 0-12.55 5.66-12.55 12.55c0 4.02 1.935 7.613 4.91 9.916L14.815 54.172a12.354 12.354 0 0 0-2.316-.223C5.61 53.95-.05 59.61-.05 66.5c0 6.89 5.66 12.55 12.55 12.55c5.13 0 9.54-3.151 11.463-7.603l51.277 7.71c1.232 5.629 6.281 9.894 12.26 9.894c6.656 0 12.114-5.297 12.48-11.867a3.5 3.5 0 0 0 .07-.684a3.5 3.5 0 0 0-.071-.7c-.375-6.562-5.829-11.85-12.479-11.85c-.134 0-.264.015-.396.019L80.242 43.05c3.275-2.127 5.509-5.746 5.738-9.867a3.5 3.5 0 0 0 .07-.684a3.5 3.5 0 0 0-.071-.7c-.375-6.562-5.829-11.85-12.479-11.85c-5.062 0-9.452 3.06-11.43 7.415l-17.082-4.517a3.5 3.5 0 0 0-.01-.047c-.374-6.563-5.828-11.852-12.478-11.852zm0 7c3.107 0 5.55 2.443 5.55 5.55c0 3.107-2.443 5.55-5.55 5.55c-3.107 0-5.55-2.443-5.55-5.55c0-3.107 2.443-5.55 5.55-5.55zm41 9c3.107 0 5.55 2.443 5.55 5.55c0 3.107-2.443 5.55-5.55 5.55c-3.107 0-5.55-2.443-5.55-5.55c0-3.107 2.443-5.55 5.55-5.55zm-30.137 2.708l17.739 4.69C62.007 40.37 67.239 45.05 73.5 45.05l.033-.002l6.92 21.092a12.688 12.688 0 0 0-4.705 6.015l-50.916-7.654a12.611 12.611 0 0 0-3.787-7.13l10.342-21.378c.368.033.737.057 1.113.057c4.652 0 8.71-2.592 10.863-6.393zM12.5 60.95c3.107 0 5.55 2.444 5.55 5.551s-2.443 5.55-5.55 5.55c-3.107 0-5.55-2.443-5.55-5.55c0-3.107 2.443-5.55 5.55-5.55zm75 10c3.107 0 5.55 2.444 5.55 5.551s-2.443 5.55-5.55 5.55c-3.107 0-5.55-2.443-5.55-5.55c0-3.107 2.443-5.55 5.55-5.55z"></path></g></svg>',
    rectangle:
      '<svg width="100%" height="100%" fill="#000000" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M 7.7148 49.5742 L 48.2852 49.5742 C 53.1836 49.5742 55.6446 47.1367 55.6446 42.3086 L 55.6446 13.6914 C 55.6446 8.8633 53.1836 6.4258 48.2852 6.4258 L 7.7148 6.4258 C 2.8398 6.4258 .3554 8.8398 .3554 13.6914 L .3554 42.3086 C .3554 47.1602 2.8398 49.5742 7.7148 49.5742 Z M 7.7851 45.8008 C 5.4413 45.8008 4.1288 44.5586 4.1288 42.1211 L 4.1288 13.8789 C 4.1288 11.4414 5.4413 10.1992 7.7851 10.1992 L 48.2147 10.1992 C 50.5350 10.1992 51.8708 11.4414 51.8708 13.8789 L 51.8708 42.1211 C 51.8708 44.5586 50.5350 45.8008 48.2147 45.8008 Z"></path></g></svg>',
    circle:
      '<svg width="100%" height="100%" viewBox="0 0 24 24" stroke="#000000" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path> </g></svg>'
  },
  settings: {
    close:
      '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"/></svg>'
  }
}

const config: IConfig = {
  defaults: {
    elementId: "mapyna",
    gMapId: null,
    scripts: {
      googleMapMarkerClustererScriptSource:
        "https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js",
      googleMapMarkerSpiderfierScriptSource:
        "https://mapyna.realtyna.info/assets/oms.js",
      leafletMarkerClustererScriptSource:
        "https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js",
      leafletMarkerClustererStyleSource:
        "https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css",
      leafletMarkerClustererDefaultStyleSource:
        "https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css"
    },

    /*
     * Default Options
     */
    defaultZoom: null,
    defaultCenter: null,
    defaultView: "map",
    scrollWheel: true,

    /*
     * Marker Options
     */
    latitudeKey: "lat",
    longitudeKey: "lng",
    idKey: "id",
    priceKey: "price",
    priceRender: null,
    markerStyles: [
      {
        type: "price",
        textColor: "white",
        fontSize: 12,
        fontWeight: "700",
        fillColor: "#4c00ff",
        strokeColor: "#201bae",
        stroke: 1,
        opacity: 1
      }
    ],

    /*
     * Controller Options
     */
    controllers: {
      zoomX: "TOP_RIGHT",
      view: "TOP_RIGHT",
      draw: "RIGHT_TOP",
      layers: "RIGHT_TOP"
    },
    controllerSpace: 7,

    /*
     * Drawing Options
     */
    closedFreehand: false,
    zoomAfterDrawing: false,
    drawing: {
      style: {
        strokeColor: "#e74c3c",
        strokeOpacity: 0.9,
        strokeWeight: 4,
        fillColor: "transparent",
        fillOpacity: 0
      },
      payload: null
    },

    /*
     * Notify Options
     */
    notify: {
      position: "TOP_LEFT",
      space: 5,
      duration: 4000, // millisecond
      persist: false, // millisecond
      style: "default"
    },

    /*
     * Clustering Options
     */
    clustering: {
      enabled: false,
      googleMapOptions: {},
      leafletOptions: {}
    },

    /*
     * InfoWindow Options
     */
    infoWindow: {
      enabled: true,
      trigger: "click", //click, mouseover
      dataKey: "infoWindow",
      caching: true
    },

    /*
     * Loading Options
     */
    loading: {
      className: "mapyna-loading",
      position: "LEFT_TOP",
      space: 7
    },

    /*
     * Layer Options
     */
    layers: {
      schools: {
        name: "schools",
        label: "Schools",
        enabled: true,
        type: "point",
        minZoom: 12,
        latitudeKey: "lat",
        longitudeKey: "lng",
        idKey: "id",
        markerStyles: {
          type: "custom",
          size: 32,
          svg: assets.controllers.schools,
          opacity: 1
        },
        infoWindow: {
          enabled: true,
          trigger: "click",
          dataKey: "infoWindow",
          caching: true
        }
      },
      zipcodes: {
        name: "zipcodes",
        label: "Zipcodes",
        enabled: true,
        latitudeKey: "lat",
        longitudeKey: "lng",
        type: "zone",
        minZoom: 12
      },
      neighbourhoods: {
        name: "neighbourhoods",
        label: "Neighborhoods",
        latitudeKey: "lat",
        longitudeKey: "lng",
        enabled: true,
        type: "zone",
        minZoom: 12
      }
    },
    /*
     * RealityFeed Integration Options
     */
    rfEnabled: false,
    rfIntegration: {
      apiBase: "https://api.realtyfeed.com",
      token: null,
      layers: {
        schools: {
          latitudeKey: "LAT",
          longitudeKey: "LON",
          idKey: "NCESSCH",
          infoWindow: {
            enabled: true,
            trigger: "click",
            render: async (schoolData) => {
              const html = `<div class="mapyna-infowindow-card mapyna-school-infowindow">
                              <div class="mapyna-infowindow-details">
                                <div class="mapyna-infowindow-details-inner">
                                  <div class="mapyna-infowindow-details-top">
                                        <strong>${schoolData.NAME}</strong>
                                  </div>
                                  <div class="mapyna-infowindow-details-bottom">
                                    <div class="mapyna-infowindow-property-address">${schoolData.STATE}, ${schoolData.CITY}</div>
                                      <div class="mapyna-infowindow-property-city-state-zip">${schoolData.STREET}</div>
                                      </div>
                                    </div>
                                </div>
                            </div>`
              return html
            },
            caching: false
          }
        }
      }
    }
  },

  markerIcons: {
    pin: {
      path: "M38.0 6.29c-12.23 0-22.17 9.98-22.17 22.17 0 12.23 22.17 41.14 22.17 41.14s22.17-28.91 22.17-41.14c0-12.19-9.94-22.17-22.17-22.17zm0 33.22a10.99 10.99 0 1 1 0-21.98 10.99 10.99 0 0 1 0 21.98z",
      viewBox: "6 16 64 44"
    },
    circle: {
      path: "M32,0A32,32,0,1,0,32,64A32,32,0,1,0,32,0Z",
      viewBox: null
    }
  },

  assets: assets
}

export default config
