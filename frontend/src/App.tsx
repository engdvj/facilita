import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'
import ChangePassword from './pages/ChangePassword'
import Admin from './pages/Admin'
import AdminLinks from './pages/AdminLinks'
import AdminCategories from './pages/AdminCategories'
import AdminColors from './pages/AdminColors'
import AdminUsers from './pages/AdminUsers'
import AdminDashboard from './pages/AdminDashboard'
import AdminFiles from './pages/AdminFiles'
import UserLinks from './pages/UserLinks'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/user/links">
          <Route index element={<UserLinks />} />
          <Route path=":id" element={<UserLinks />} />
        </Route>
        <Route path="/admin" element={<Admin />}>
          <Route index element={<AdminDashboard />} />
          <Route path="links">
            <Route index element={<AdminLinks />} />
            <Route path=":id" element={<AdminLinks />} />
          </Route>
          <Route path="files" element={<AdminFiles />} />
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
