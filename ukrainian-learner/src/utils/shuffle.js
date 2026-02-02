/**
 * Fisher-Yates shuffle algorithm
 * Returns a new shuffled array without modifying the original
 */
export function shuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Pick n random items from an array
 * Returns a new array with the picked items
 */
export function pickRandom(array, n) {
  const shuffled = shuffle(array)
  return shuffled.slice(0, n)
}

/**
 * Pick n random items from an array, excluding certain items
 */
export function pickRandomExcluding(array, n, exclude) {
  const excludeSet = new Set(exclude)
  const filtered = array.filter(item => !excludeSet.has(item))
  return pickRandom(filtered, n)
}
