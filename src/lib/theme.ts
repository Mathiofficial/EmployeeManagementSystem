export type ThemeMode = 'light' | 'dark' | 'auto'

const THEME_CHANGE_EVENT = 'app-theme-change'

export function getStoredThemeMode(): ThemeMode {
  const stored = window.localStorage.getItem('theme')
  return stored === 'light' || stored === 'dark' || stored === 'auto'
    ? stored
    : 'auto'
}

export function applyThemeMode(mode: ThemeMode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode
  const root = document.documentElement

  root.classList.remove('light', 'dark')
  root.classList.add(resolved)

  if (mode === 'auto') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', mode)
  }

  root.style.colorScheme = resolved
  window.localStorage.setItem('theme', mode)
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: mode }))
}

export function subscribeToThemeModeChange(
  listener: (mode: ThemeMode) => void,
) {
  function handleThemeChange(event: Event) {
    if (event instanceof CustomEvent) {
      const mode = event.detail
      if (mode === 'light' || mode === 'dark' || mode === 'auto') {
        listener(mode)
      }
    }
  }

  window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange)
  return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange)
}
