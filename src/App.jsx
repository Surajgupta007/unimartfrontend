import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Marketplace from './pages/Marketplace'
import ProductUpload from './pages/ProductUpload'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Dashboard from './pages/Dashboard'
import Wishlist from './pages/Wishlist'
import MeetingConfirmation from './pages/MeetingConfirmation'
import Notifications from './pages/Notifications'
import PaymentPage from './pages/PaymentPage'
import ProfileSettings from './pages/ProfileSettings'
import OrderConfirmed from './pages/OrderConfirmed'
import SellerDashboard from './pages/SellerDashboard'
import BuyerBookings from './pages/BuyerBookings'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/upload" element={<ProductUpload />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/meeting-confirmation" element={<MeetingConfirmation />} />
          <Route path="/checkout/:orderId" element={<PaymentPage />} />
          <Route path="/order-confirmed/:orderId" element={<OrderConfirmed />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/buyer-bookings" element={<BuyerBookings />} />
          <Route path="/settings" element={<ProfileSettings />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
