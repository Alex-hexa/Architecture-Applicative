import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lbc-orange font-black text-2xl tracking-tighter">
            leMauvaisCoin
          </Link>
          <Link to="/sales/new" className="bg-lbc-orange hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
            <span className="mr-2">+</span> Déposer une annonce
          </Link>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium">
          {isAuthenticated ? (
            <>
              <Link to="/favorites" className="hover:bg-gray-100 p-2 rounded-lg transition-colors flex flex-col items-center">
                Favoris
              </Link>
              <Link to="/profile" className="hover:bg-gray-100 p-2 rounded-lg transition-colors flex flex-col items-center">
                Mon Profil
              </Link>
              <button 
                onClick={handleLogout}
                className="hover:bg-gray-100 p-2 rounded-lg transition-colors flex flex-col items-center text-red-600"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link 
              to="/login"
              className="hover:bg-gray-100 p-2 rounded-lg transition-colors flex flex-col items-center"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}