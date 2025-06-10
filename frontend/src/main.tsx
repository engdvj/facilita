import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import api from './api'

const saved = localStorage.getItem('theme-custom')
if (saved) {
  try {
    const theme = JSON.parse(saved)
    Object.entries(theme).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v as string)
    })
  } catch {}
}

api
  .get('/theme')
  .then(({ data }) => {
    if (data.theme) {
      Object.entries(data.theme).forEach(([k, v]) => {
        document.documentElement.style.setProperty(k, v as string)
      })
      localStorage.setItem('theme-custom', JSON.stringify(data.theme))
    }
  })
  .catch(() => {})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
)
