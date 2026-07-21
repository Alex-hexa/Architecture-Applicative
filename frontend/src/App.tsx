import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import CreateSale from './pages/CreateSale';
import DetailsSale from './pages/DetailsSale';
import EditSale from './pages/EditSale';
import Register from './pages/Register';
import Orders from './pages/Orders';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/sales/new" element={<CreateSale />} />
            <Route path="/sales/:id" element={<DetailsSale />} />
            <Route path="/sales/:id/edit" element={<EditSale />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;