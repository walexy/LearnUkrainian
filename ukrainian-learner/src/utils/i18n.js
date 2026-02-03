// Simple i18n utility for Ukrainian UI labels
// Supports three levels: 'none', 'labels', 'full'

const translations = {
  // Navigation
  nav: {
    home: { en: 'Home', uk: 'Дім' },
    cyrillic: { en: 'Cyrillic', uk: 'Кирилиця' },
    listening: { en: 'Listening', uk: 'Слухання' },
    colleague: { en: 'Colleague', uk: 'Колега' },
    dashboard: { en: 'Dashboard', uk: 'Прогрес' },
  },

  // Common actions
  actions: {
    start: { en: 'Start', uk: 'Почати' },
    continue: { en: 'Continue', uk: 'Продовжити' },
    save: { en: 'Save', uk: 'Зберегти' },
    cancel: { en: 'Cancel', uk: 'Скасувати' },
    next: { en: 'Next', uk: 'Далі' },
    previous: { en: 'Previous', uk: 'Назад' },
    done: { en: 'Done', uk: 'Готово' },
  },

  // Learning related
  learning: {
    learn: { en: 'Learn', uk: 'Вчити' },
    practice: { en: 'Practice', uk: 'Практика' },
    progress: { en: 'Progress', uk: 'Прогрес' },
    letters: { en: 'Letters', uk: 'Букви' },
    words: { en: 'Words', uk: 'Слова' },
  },

  // Listening related
  listening: {
    session: { en: 'Session', uk: 'Сесія' },
    comprehension: { en: 'Comprehension', uk: 'Розуміння' },
    duration: { en: 'Duration', uk: 'Тривалість' },
    hours: { en: 'Hours', uk: 'Годин' },
    minutes: { en: 'Minutes', uk: 'Хвилин' },
  },

  // Stats
  stats: {
    streak: { en: 'Streak', uk: 'Серія' },
    accuracy: { en: 'Accuracy', uk: 'Точність' },
    mastered: { en: 'Mastered', uk: 'Освоєно' },
  },
}

/**
 * Get translated text based on UI level
 * @param {string} key - Dot-notation key like 'nav.home'
 * @param {string} level - 'none', 'labels', or 'full'
 * @returns {string} Translated text
 */
export function t(key, level = 'none') {
  const keys = key.split('.')
  let translation = translations

  for (const k of keys) {
    translation = translation?.[k]
    if (!translation) return key // Fallback to key if not found
  }

  if (!translation.en || !translation.uk) return key

  switch (level) {
    case 'none':
      return translation.en
    case 'labels':
      return `${translation.uk} (${translation.en})`
    case 'full':
      return translation.uk
    default:
      return translation.en
  }
}

/**
 * Get all translations for a category
 * @param {string} category - Category like 'nav' or 'actions'
 * @param {string} level - 'none', 'labels', or 'full'
 * @returns {Object} Object with translated values
 */
export function getCategory(category, level = 'none') {
  const categoryData = translations[category]
  if (!categoryData) return {}

  const result = {}
  for (const [key, value] of Object.entries(categoryData)) {
    switch (level) {
      case 'none':
        result[key] = value.en
        break
      case 'labels':
        result[key] = `${value.uk} (${value.en})`
        break
      case 'full':
        result[key] = value.uk
        break
      default:
        result[key] = value.en
    }
  }
  return result
}

// Export translations for direct access if needed
export { translations }
