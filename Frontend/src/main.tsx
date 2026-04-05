import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.scss'
import App from './App.tsx'
<<<<<<< HEAD
import { DataProvider } from './context/DataContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
=======
>>>>>>> c64edc70b3dd160f2bebcaaf32b56c64a73125db

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
