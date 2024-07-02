# Mapyna: Seamless Integration of Google Maps and Leaflet

Mapyna is a powerful JavaScript library tailored for location-based websites, perfect for platforms like real estate sites that need to display locations as markers on maps. It seamlessly integrates interactive maps into websites, enhancing user experience and providing valuable location-based information.

Demo : https://mapyna.realtyna.info/

## Table of contents

- [Mapyna: Seamless Integration of Google Maps and Leaflet](#mapyna-seamless-integration-of-google-maps-and-leaflet)
  - [Table of contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [License](#license)

## Installation

```sh
$ npm install mapyna
```

## Usage

add google map or leaflet to your project

```js
import mapyna from 'mapyna'

// ...

const mapynaConfig:TMapynaConfig = {
  // ...
}

// GoogleMap
mapyna(mapynaConfig).googleMap()

// LeafletMap
mapyna(mapynaConfig).leaflet()
```

[Mapyna Config Doc](https://code.realtyna.com/Mapyna/types/TMapynaConfig.html)

## Contributing

If you'd like to contribute to this project, please follow these steps:

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Add your changes: `git add .`
4.  Commit your changes: `git commit -am 'Add some feature'`
5.  Push to the branch: `git push origin my-new-feature`
6.  Submit a pull request

## License

[MIT](https://github.com/fullstackreact/google-maps-react/blob/HEAD/LICENSE)
