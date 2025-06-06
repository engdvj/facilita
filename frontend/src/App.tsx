import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import Login from './pages/Login'
import Admin from './pages/Admin'
import AdminLinks from './pages/AdminLinks'
import AdminCategories from './pages/AdminCategories'
import AdminColors from './pages/AdminColors'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<Admin />}>
          <Route index element={<AdminDashboard />} />
          <Route path="links">
            <Route index element={<AdminLinks />} />
            <Route path=":id" element={<AdminLinks />} />
          </Route>

          <Route path="categories" element={<AdminCategories />} />
          <Route path="colors" element={<AdminColors />} />
        </Route>
      </Routes>
      <Toaster position="bottom-center" />
    </BrowserRouter>
  )
}
