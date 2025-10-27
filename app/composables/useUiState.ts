import { useState } from '#app'

export const useUiState = () => {
  const showFilters = useState<boolean>('ui:showFilters', () => false)
  return { showFilters }
}

