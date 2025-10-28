export const useThemeList = () => {
  const themes = [
    {
      id: 'clock-fixed',
      title: 'Fixed Clock Widget',
      description: 'Beautiful analog clock with fixed positioning',
      thumbnail: '/theme/clock_preview.png',
      file: '/theme/theme_clock_fixed.html',
      category: 'Widget'
    },
    {
      id: 'digital-clock',
      title: 'Digital Clock',
      description: 'Modern digital clock display',
      thumbnail: '/theme/digital_preview.png',
      file: '/theme/theme_digital_clock.html',
      category: 'Widget'
    },
    {
      id: 'weather-widget',
      title: 'Weather Widget',
      description: 'Real-time weather information display',
      thumbnail: '/theme/weather_preview.png',
      file: '/theme/theme_weather.html',
      category: 'Widget'
    },
    {
      id: 'calendar',
      title: 'Calendar Widget',
      description: 'Minimal calendar with events',
      thumbnail: '/theme/calendar_preview.png',
      file: '/theme/theme_calendar.html',
      category: 'Productivity'
    },
    {
      id: 'music-player',
      title: 'Music Player UI',
      description: 'Elegant music player interface',
      thumbnail: '/theme/music_preview.png',
      file: '/theme/theme_music.html',
      category: 'Media'
    },
    {
      id: 'todo-list',
      title: 'Todo List',
      description: 'Simple and effective task manager',
      thumbnail: '/theme/todo_preview.png',
      file: '/theme/theme_todo.html',
      category: 'Productivity'
    }
  ]

  const downloadTheme = async (themeFile: string, themeName: string) => {
    try {
      const response = await fetch(themeFile)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${themeName}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      console.error('Download error:', error)
      return false
    }
  }

  const getThemesByCategory = (category?: string) => {
    if (!category) return themes
    return themes.filter(t => t.category === category)
  }

  const categories = [...new Set(themes.map(t => t.category))]

  return {
    themes,
    categories,
    downloadTheme,
    getThemesByCategory
  }
}