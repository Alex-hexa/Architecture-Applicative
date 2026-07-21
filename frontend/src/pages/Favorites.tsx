import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchFavorites = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/preferences', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erreur lors du chargement des favoris');
        
        const data = await response.json();
        setFavorites(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [token]);

  const removeFavorite = async (saleId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/preferences/${saleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok || response.status === 204) {
        setFavorites(prev => prev.filter(pref => pref.sale_id !== saleId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Mes Annonces Favorites</h2>

      {loading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lbc-orange mx-auto mt-12"></div>}
      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>}

      {!loading && favorites.length === 0 && (
        <p className="text-gray-500 text-center py-12">Vous n'avez pas encore de favoris.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {favorites.map((pref) => {
          const sale = pref.sale;
          if (!sale) return null;

          return (
            <div key={pref.id} className="bg-white p-4 rounded-xl shadow-sm relative flex flex-col">
              <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                Aucune image
                <button
                  onClick={() => removeFavorite(sale.id)}
                  className="absolute top-6 right-6 p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                  title="Retirer des favoris"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                </button>
              </div>
              <h3 className="font-bold line-clamp-2 mb-1">{sale.title}</h3>
              <p className="text-lbc-orange font-bold text-lg mb-2">{sale.price} €</p>
            </div>
          );
        })}
      </div>
    </main>
  );
}