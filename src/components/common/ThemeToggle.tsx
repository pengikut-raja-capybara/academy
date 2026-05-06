import { Moon, Sun } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { toggleTheme } from '../../features/learning/learningSlice'

export default function ThemeToggle() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.learning.theme)

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-80 transition-all shadow-sm border border-border"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  )
}
