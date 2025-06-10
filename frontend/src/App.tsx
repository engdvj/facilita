import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ChangePassword from './pages/ChangePassword'
import Admin from './pages/Admin'
import AdminLinks from './pages/AdminLinks'
import AdminCategories from './pages/AdminCategories'
import AdminColors from './pages/AdminColors'
import AdminUsers from './pages/AdminUsers'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/admin" element={<Admin />}>
          <Route index element={<AdminDashboard />} />
          <Route path="links">
            <Route index element={<AdminLinks />} />
            <Route path=":id" element={<AdminLinks />} />
          </Route>
          <Route path="categories">
            <Route index element={<AdminCategories />} />
            <Route path=":id" element={<AdminCategories />} />
          </Route>
          <Route path="colors" element={<AdminColors />} />
          <Route path="users">
            <Route index element={<AdminUsers />} />
            <Route path=":id" element={<AdminUsers />} />
          </Route>
        </Route>
      </Routes>
      <Toaster position="bottom-center" />
    </BrowserRouter>
  )
}
