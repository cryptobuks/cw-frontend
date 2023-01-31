export function noop () {}

export function clamp (val, min, max) {
  if (val < min) {
    return min
  }
  if (val > max) {
    return max
  }
  return val
}

export function readFileDataUrl (file) {
  const reader = new FileReader()

  return new Promise((resolve, reject) => {
    reader.onload = readerEvent => resolve(readerEvent.target.result)
    reader.onerror = reject

    reader.readAsDataURL(file)
  })
}

/**
 * Create a cached version of a pure function.
 */
export function cached (fn) {
  const cache = Object.create(null)

  return function cachedFn (str) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }
}

/**
 * Capitalize a string.
 */
export const capitalize = cached((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
})

export function isActive (state, nodeNames) {
  const { selection, doc } = state
  const { from, to } = selection

  let keepLooking = true
  let active = false

  doc.nodesBetween(from, to, (node) => {
    const name = node.type.name
    if (
      keepLooking &&
      nodeNames.includes(name)
    ) {
      keepLooking = false
      active = true
    }
    return keepLooking
  })

  return active
}
