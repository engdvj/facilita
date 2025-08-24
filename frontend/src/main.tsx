import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

// Component health check in development
// if (process.env.NODE_ENV === 'development') {
//   import('./utils/componentCheck');
// }

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
)
