import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const saved = localStorage.getItem('theme-custom')
if (saved) {
  try {
    const theme = JSON.parse(saved)
    Object.entries(theme).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v as string)
    })
  } catch {}
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
)
