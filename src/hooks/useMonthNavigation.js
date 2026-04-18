import { useState } from 'react'

/**
 * Gerencia o estado de mês/ano atual com navegação prev/next.
 */
export function useMonthNavigation(initialMonth, initialYear) {
  const now = new Date()

  const [month, setMonth] = useState(initialMonth ?? now.getMonth() + 1)
  const [year, setYear] = useState(initialYear ?? now.getFullYear())

  const goToPrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(y => y - 1)
    } else {
      setMonth(m => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(y => y + 1)
    } else {
      setMonth(m => m + 1)
    }
  }

  const setMonthYear = (newMonth, newYear) => {
    setMonth(newMonth)
    setYear(newYear)
  }

  return { month, year, goToPrevMonth, goToNextMonth, setMonthYear }
}
