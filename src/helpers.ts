/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: any): boolean {
  return item && typeof item === "object" && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target: any, ...sources: any) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources)
}

/* Stack-based Douglas Peucker line simplification routine
       returned is a reduced GLatLng array
       After code by  Dr. Gary J. Robinson,
       Environmental Systems Science Centre,
       University of Reading, Reading, UK
    */

export function GDouglasPeucker(
  source: { lat: number; lng: number }[],
  zoom: number
) {
  var n_source, n_stack, n_dest, start, end, i, sig
  var dev_sqr, max_dev_sqr, band_sqr
  var x12, y12, d12, x13, y13, d13, x23, y23, d23
  var F = (Math.PI / 180.0) * 0.5
  var index =
    [] /* aray of indexes of source points to include in the reduced line */
  var sig_start = [] /* indices of start & end of working section */
  var sig_end = []

  const kink = () => {
    if (zoom <= 5) {
      return 20000
    } else if (zoom <= 7) {
      return 10000
    } else if (zoom <= 8) {
      return 4000
    } else if (zoom <= 9) {
      return 1000
    } else if (zoom <= 10) {
      return 600
    } else if (zoom <= 12) {
      return 400
    } else if (zoom <= 14) {
      return 100
    } else if (zoom <= 16) {
      return 30
    } else if (zoom <= 18) {
      return 10
    } else if (zoom <= 20) {
      return 5
    } else {
      return 2
    }
  }

  /* check for simple cases */

  if (source.length < 3) return source /* one or two points */

  /* more complex case. initialize stack */

  n_source = source.length
  band_sqr = (kink() * 360.0) / (2.0 * Math.PI * 6378137.0) /* Now in degrees */
  band_sqr *= band_sqr
  n_dest = 0
  sig_start[0] = 0
  sig_end[0] = n_source - 1
  n_stack = 1

  /* while the stack is not empty  ... */
  while (n_stack > 0) {
    /* ... pop the top-most entries off the stacks */

    start = sig_start[n_stack - 1]
    end = sig_end[n_stack - 1]

    const startLng = source[start].lng
    const startLat = source[start].lat

    const endLng = source[end].lng
    const endLat = source[end].lat

    n_stack--

    if (end - start > 1) {
      /* any intermediate points ? */

      /* ... yes, so find most deviant intermediate point to
                   either side of line joining start & end points */

      x12 = endLng - startLng
      y12 = endLat - startLat
      if (Math.abs(x12) > 180.0) x12 = 360.0 - Math.abs(x12)
      x12 *= Math.cos(F * (endLat + startLat)) /* use avg lat to reduce lng */
      d12 = x12 * x12 + y12 * y12

      for (i = start + 1, sig = start, max_dev_sqr = -1.0; i < end; i++) {
        const lat = source[i].lat
        const lng = source[i].lng

        x13 = lng - startLng
        y13 = lat - startLat
        if (Math.abs(x13) > 180.0) x13 = 360.0 - Math.abs(x13)
        x13 *= Math.cos(F * (lat + startLat))
        d13 = x13 * x13 + y13 * y13

        x23 = lng - endLng
        y23 = lat - endLat
        if (Math.abs(x23) > 180.0) x23 = 360.0 - Math.abs(x23)
        x23 *= Math.cos(F * (lat + endLat))
        d23 = x23 * x23 + y23 * y23

        if (d13 >= d12 + d23) dev_sqr = d23
        else if (d23 >= d12 + d13) dev_sqr = d13
        else dev_sqr = ((x13 * y12 - y13 * x12) * (x13 * y12 - y13 * x12)) / d12 // solve triangle

        if (dev_sqr > max_dev_sqr) {
          sig = i
          max_dev_sqr = dev_sqr
        }
      }

      if (max_dev_sqr < band_sqr) {
        /* is there a sig. intermediate point ? */
        /* ... no, so transfer current start point */
        index[n_dest] = start
        n_dest++
      } else {
        /* ... yes, so push two sub-sections on stack for further processing */
        n_stack++
        sig_start[n_stack - 1] = sig
        sig_end[n_stack - 1] = end
        n_stack++
        sig_start[n_stack - 1] = start
        sig_end[n_stack - 1] = sig
      }
    } else {
      /* ... no intermediate points, so transfer current start point */
      index[n_dest] = start
      n_dest++
    }
  }

  /* transfer last point */
  index[n_dest] = n_source - 1
  n_dest++

  /* make return array */
  const r = []
  for (i = 0; i < n_dest; i++) r.push(source[index[i]])
  return r
}
