const UA = navigator.userAgent.toLowerCase()
export const isChrome = /chrome/.test(UA)
export const isEdge = /edge|edga/.test(UA)
export const isIOS = /ipad|iphone|ipod/i.test(navigator.platform) ||
  navigator.maxTouchPoints > 1
export const isOpera = /opr/.test(UA)
export const isSafari = !isChrome && /safari/.test(UA)

export const origin = window.location.origin
export const host = window.location.host
export const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0') || host.startsWith('192.168.')
export const isDev = host === 'dev.cowellness.net'
export const isStaging = host === 'staging.cowellness.net'
export const isProduction = host === 'www.cowellness.net'

export const environment = isLocal ? 'local' : isDev ? 'dev' : isStaging ? 'staging' : isProduction ? 'production' : 'dev'

function sortBy (array, prop) {
  const paths = prop.split('.')
  return array.sort((a, b) => {
    const textA = paths.reduce((x, y) => x[y], a)
    const textB = paths.reduce((x, y) => x[y], b)
    return textA < textB ? -1 : textA > textB ? 1 : 0
  })
}

/**
   *
   * @param {{id: string, filename: string}} avatar
   * @param {boolean} isGroupAvatar
   */
function getAvatarUrl (avatar, type = 'chat') {
  if (avatar?.id && avatar.filename) {
    return getFileUrl(avatar.id, avatar.filename)
  } else if (type === 'chat') {
    return require('~/assets/img/default-contact-avatar.svg')
  } else if (type === 'group') {
    return require('~/assets/img/default-group-avatar.svg')
  } else if (type === 'system') {
    return require('~/assets/img/default-system-avatar.svg')
  }
}

function getFileUrl (id, filename) {
  return id && filename ? `/file/${id}/${filename}` : ''
}

function formatTime (date) {
  const dateObj = new Date(date)
  if (isNaN(dateObj)) {
    return ''
  }

  return `${(dateObj.getHours() < 10 ? '0' : '') + dateObj.getHours()}:${(dateObj.getMinutes() < 10 ? '0' : '') + dateObj.getMinutes()
    }`
}

export function setTime (date, time) {
  time = time.split(':')
  date = new Date(date)
  date.setHours(...time)
  return date
}

export function digitToDate (date) {
  date = String(date)
  const day = date.substr(6, 2)
  const month = date.substr(4, 2)
  const year = date.substr(0, 4)

  return new Date(`${year}-${month}-${day}`)
}

function getAge (dateString) {
  const today = new Date()
  const birthDate = new Date(dateString)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

/**
 *
 * @param {File|Blob} file
 */
function readFile (file, output = 'text') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = e => reject(e)
    output === 'text'
      ? reader.readAsText(file, 'UTF-8')
      : output === 'base64'
        ? reader.readAsDataURL(file)
        : reject(new Error(`cannot produce ${output} output`))
  })
}

function csvToArray (csv) {
  const lines = csv.split('\n')
  return lines.map(line => line.split(','))
}

function csvToJSON (csv) {
  const lines = csv.split('\n')
  const result = []
  const headers = lines[0].split(',')
  for (let i = 1; i < lines.length; i++) {
    const obj = {}
    const currentline = lines[i].split(',')

    for (let j = 0; j < headers.length; j++) { obj[headers[j]] = currentline[j] }

    result.push(obj)
  }
  return result
}

function jsonToCSV (json) {
  const fields = Object.keys(json[0])
  const csv = json.map(row =>
    fields
      .map(fieldName =>
        JSON.stringify(row[fieldName], (key, value) =>
          value === null ? '' : value
        )
      )
      .join(',')
  )
  csv.unshift(fields.join(','))
  return csv.join('\r\n')
}

/**
 * Deep clone an object by specified properties
 * @param {Object} source Source object
 * @param {Object|Array} props Cloning properties
 *
 * Support 3 types of props:
 *  - ['_id', 'name']
 *  - [{from: 'name', to: 'name', default: 'Mike', transform: v => v && v.toLowerCase()}]
 *  - {name: DEFAULT_NAME, age: DEFAULT_AGE}
 */
export function extract (source = {}, props = {}, opts = {}) {
  const obj = source || {}
  const extractedObj = {}

  if (Array.isArray(props)) {
    props.forEach((prop) => {
      const from = prop.from || prop
      const to = prop.to || from

      if (from in obj && (!opts.ignoreNull || isNotNull(obj[from]))) {
        extractedObj[to] =
          typeof prop.transform === 'function'
            ? prop.transform(obj[from])
            : obj[from]
      } else if (typeof prop !== 'string' && 'default' in prop) {
        extractedObj[to] = prop.default
      }
    })
  } else {
    for (const key of Object.keys(props)) {
      if (key in obj) {
        extractedObj[key] = obj[key]
      } else if (props[key] !== undefined) {
        extractedObj[key] = props[key]
      }
    }
  }

  return clone(extractedObj)
}

function isNotNull (val) {
  return !(!val && typeof val === 'object')
}

/**
 * Shallow clone an object with all of its properties except for the given properties in props paramater
 * @param {Object} source Source object
 * @param {Array|String} props excepted properties
 */
export function except (source = {}, props = []) {
  const output = { ...source }
  const exceptedProps = [].concat(props)
  exceptedProps.forEach((prop) => {
    delete output[prop]
  })
  return output
}

/**
 * Deep clone an object
 * @param {*} source Source object, or could be of any type
 */
export function clone (source) {
  if (!source || typeof source !== 'object' || source instanceof Date) {
    return source
  }

  const target = Array.isArray(source) ? [] : {}
  _deepClone(source, target)

  return target
}

function _deepClone (source, target) {
  for (const key of Object.keys(source)) {
    if (
      !source[key] ||
      source[key] instanceof Date ||
      typeof source[key] !== 'object'
    ) {
      target[key] = source[key]
    } else {
      target[key] = Array.isArray(source[key]) ? [] : {}
      _deepClone(source[key], target[key])
    }
  }
}

export function createDebounce (defaultCallback, defaultDuration = 300) {
  let timeout = null
  let promise = null
  let done = null

  return (cb, duration) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    promise = promise ||
      new Promise((resolve, reject) => {
        done = resolve
      })

    timeout = setTimeout(
      async () => {
        if (typeof cb === 'function') {
          await cb()
        } else if (typeof defaultCallback === 'function') {
          await defaultCallback()
        }

        done?.()

        timeout = promise = done = null
      },
      typeof duration === 'number' ? duration : defaultDuration
    )

    return promise
  }
}

export function isModified (src, tar) {
  if (typeof src !== typeof tar) {
    return true
  }

  const srcEmpty = isEmpty(src)
  const tarEmpty = isEmpty(tar)
  if (srcEmpty !== tarEmpty) {
    return true
  }

  if (srcEmpty && tarEmpty) {
    return false
  }

  if (typeof src !== 'object') {
    return src !== tar
  }

  if (src instanceof Date || tar instanceof Date) {
    return src?.valueOf?.() !== new Date(tar)?.valueOf?.()
  }

  const keys = new Set(Object.keys(src).concat(Object.keys(tar)))
  for (const key of keys) {
    if (isModified(src[key], tar[key])) {
      return true
    }
  }

  return false
}

export function isEmpty (val) {
  return Array.isArray(val)
    ? !val.length || !val[0]
    : !val && typeof val !== 'boolean' && typeof val !== 'number'
}

function stripHtml (value) {
  const div = document.createElement('div')
  div.innerHTML = value
  const text = div.textContent || div.textContent || ''
  return text
}

export function upperFirst (str) {
  return str.slice(0, 1).toUpperCase() + str.slice(1)
}

// Copy a text to clipboard taking advantage of textarea element
// We're not using clipboard API because it is unreliable at the moment
// https://stackoverflow.com/questions/37308210/copy-current-url-button-javascript
export function copy (text) {
  const textArea = document.createElement('textarea')

  //
  // *** This styling is an extra step which is likely not required. ***
  //
  // Why is it here? To ensure:
  // 1. the element is able to have focus and selection.
  // 2. if element was to flash render it has minimal visual impact.
  // 3. less flakyness with selection and copying which **might** occur if
  //    the textarea element is not visible.
  //
  // The likelihood is the element won't even render, not even a flash,
  // so some of these are just precautions. However in IE the element
  // is visible whilst the popup box asking the user for permission for
  // the web page to copy to the clipboard.
  //

  // Place in top-left corner of screen regardless of scroll position.
  textArea.style.position = 'fixed'
  textArea.style.top = 0
  textArea.style.left = 0

  // Ensure it has a small width and height. Setting to 1px / 1em
  // doesn't work as this gives a negative w/h on some browsers.
  textArea.style.width = '2em'
  textArea.style.height = '2em'

  // We don't need padding, reducing the size if it does flash render.
  textArea.style.padding = 0

  // Clean up any borders.
  textArea.style.border = 'none'
  textArea.style.outline = 'none'
  textArea.style.boxShadow = 'none'

  // Avoid flash of white box if rendered for any reason.
  textArea.style.background = 'transparent'

  textArea.value = text

  document.body.appendChild(textArea)

  textArea.select()

  try {
    document.execCommand('copy')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('Copy error', err)
    return false
  }

  document.body.removeChild(textArea)
  return true
}

/**
 *
 * @param {string[]|Object.<string, true>} colorsToExclude
 *
 * Can be either an array or a dicitonary. Use a dictionary for faster lookups.
 */
export function getNewColor (colorsToExclude = {}) {
  const values = '0123456789abcdef'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += values[Math.floor(Math.random() * values.length)]
  }

  if ((!Array.isArray(colorsToExclude) && !(color in colorsToExclude)) || !colorsToExclude.includes(color)) {
    return color
  } else {
    return getNewColor(colorsToExclude)
  }
}

export function updateArrayItem (items, item, idKey) {
  const val = idKey ? item[idKey] : item
  const i = idKey
    ? items.findIndex(x => x[idKey] === val)
    : items.indexOf(item)
  if (i === -1) {
    items.push(item)
  } else {
    items.splice(i, 1, item)
  }
}

const convertTable = {
  'km:mi': km => km / 1.60934,
  'mi:km': mi => mi * 1.60934,
  'kg:lb': kg => kg * 2.20462,
  'lb:kg': lb => lb / 2.20462,
  'cm:ft': cm => cm / 30.48,
  'ft:cm': ft => ft * 30.48,
  '°C:°F': c => c * 9 / 5 + 32,
  '°F:°C': f => (f - 32) * 5 / 9
}

function convertMeasurement (val, toUnit, fromUnit) {
  return val && toUnit !== fromUnit
    ? convertTable[toUnit + ':' + fromUnit]?.(val) || val
    : val
}

function formatMeasurement (val, toUnit, fromUnit, format) {
  return formatNumber(convertMeasurement(val, toUnit, fromUnit), format)
}

const enNumberFormater = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const itNumberFormater = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 })
function formatNumber (n, format) {
  format = format || '1,000.00'
  return n ? format === '1,000.00' ? enNumberFormater.format(n) : itNumberFormater.format(n) : n
}

export const wsResponseHandler = (res) => {
  if (res.success !== true) { throw res }
  return res.data
}

export const utils = ctx => ({
  copy,
  sortBy,
  getAvatarUrl,
  getFileUrl,
  formatTime,
  setTime,
  digitToDate,
  getAge,
  readFile,
  csvToArray,
  csvToJSON,
  jsonToCSV,
  debounce: createDebounce(),
  createDebounce,
  extract,
  except,
  clone,
  isModified,
  isEmpty,
  wsResponseHandler,
  isChrome,
  isEdge,
  isIOS,
  isOpera,
  isSafari,
  origin,
  host,
  isDev,
  isLocal,
  isStaging,
  isProduction,
  environment,
  stripHtml,
  upperFirst,
  getNewColor,
  updateArrayItem,
  convertMeasurement,
  formatMeasurement,
  formatNumber,
  formatDate (d, format = 'DD.MM.YYYY') {
    return d ? ctx.$dayjs(d).format(format) : d
  },
  /**
   * NOTE: This is a simple implementation that doesn't take time-zone differences into account. For more
   * accurate results use a specialized library function (e.g. date-fns).
   *
   * @param {String|Date} date
   */
  getHumanDate (date) {
    date = new Date(date)
    const MILLISECONDS_IN_DAY = 86400000
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday'
    ]

    // create a new date object so we don't mess with the original
    const startOfDate = new Date(date.getTime())
    startOfDate.setHours(0, 0, 0, 0)
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const differenceInDays = Math.round(
      (startOfToday - startOfDate) / MILLISECONDS_IN_DAY
    )

    if (differenceInDays === 0) {
      return ctx.app.i18n.t('days.today')
    } else if (differenceInDays === 1) {
      return ctx.app.i18n.t('days.yesterday')
    } else if (differenceInDays === -1) {
      return ctx.app.i18n.t('days.tomorrow')
    } else if (differenceInDays < 7 && differenceInDays > 0) {
      return ctx.app.i18n.t(`days.${days[date.getDay()]}`)
    } else {
      return ctx.app.i18n.d(date).replace(/\//gm, '.')
    }
  },

  getHumanDateOrTime (date) {
    const day = this.getHumanDate(date)
    if (day === ctx.app.i18n.t('days.today')) {
      return this.formatTime(date)
    }
    return day
  },

  groupBy (array, f) {
    const groups = {}
    array.forEach(function (o) {
      const group = JSON.stringify(f(o))
      groups[group] = groups[group] || []
      groups[group].push(o)
    })
    return Object.keys(groups).map(function (group) {
      return groups[group]
    })
  },

  getDashbaoardDateOrTime (date) {
    const day = this.getHumanDate(date)
    if (day === ctx.app.i18n.t('days.today')) {
      return this.formatTime(date)
    } else {
      return ctx.app.$dayjs(date).format('DD/MM')
    }
  },

  getHumanDateTime (date, separator = ' ') {
    const day = this.getHumanDate(date)
    const time = this.formatTime(date)
    return day + separator + time
  },

  parseJSON (jsonStr) {
    try {
      return JSON.parse(jsonStr)
    } catch (_) {
      return null
    }
  }
})

export default (ctx, inject) => {
  inject('utils', utils(ctx))
}
