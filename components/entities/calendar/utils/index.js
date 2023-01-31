/**
 *
 * @param {string} timeString
 * @returns number
 *
 * Takes a string of the format hh:mm and returns a numeric representation
 */
export function parseTimeString (timeString) {
  let [hh, mm] = timeString.split(':')
  hh = parseInt(hh || 0)
  mm = parseInt(mm || 0)

  return hh + mm / 60
}

/**
 * @param {number} timeInHours
 * @returns string
 *
 * Takes a time value (in hours) and returns a string representation of the format hh:mm
 */
export function getTimeString (timeInHours) {
  const hh = Math.floor(timeInHours)
  const mm = Math.round((timeInHours % 1) * 60)

  return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`
}
