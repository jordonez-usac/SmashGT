import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Chunk viejo después de un deploy: recargar, como mucho cada 10 s
window.addEventListener('vite:preloadError', (evento) => {
  try {
    if (Date.now() - Number(sessionStorage.getItem('smashgt_recarga') || 0) < 10000) return
    sessionStorage.setItem('smashgt_recarga', Date.now())
  } catch { /* sin almacenamiento */ }
  evento.preventDefault()
  location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
