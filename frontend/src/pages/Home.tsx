import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Sale {
  id: string;
  title: string;
  price: number;
  description: string | null;
  categorie: string;
  seller_rating: number;
  wear_level: number;
  score?: number; 
}

export default function Home() {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { token } = useAuth(); 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const salesResponse = await fetch('http://localhost:3000/api/sales', { method: 'GET', headers });
        if (!salesResponse.ok) throw new Error('Erreur lors du chargement des annonces');
        setSales(await salesResponse.json());

        if (token) {
          const prefResponse = await fetch('http://localhost:3000/api/preferences', { method: 'GET', headers });
          if (prefResponse.ok) {
            const prefData = await prefResponse.json();
            setFavorites(new Set(prefData.map((pref: any) => pref.sale_id)));
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, refreshTrigger]);

  const handleFavorite = async (e: React.MouseEvent, saleId: string) => {
    e.stopPropagation(); // Empêche le clic sur le cœur de déclencher la navigation vers l'annonce
    
    if (!token) {
      alert("Veuillez vous connecter pour gérer vos favoris.");
      return;
    }

    const isCurrentlyFavorite = favorites.has(saleId);
    
    try {
      if (isCurrentlyFavorite) {
        const response = await fetch(`http://localhost:3000/api/preferences/${saleId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok || response.status === 204) {
          setFavorites(prev => {
            const next = new Set(prev);
            next.delete(saleId);
            return next;
          });
          setRefreshTrigger(prev => prev + 1);
        }
      } else {
        const response = await fetch('http://localhost:3000/api/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ sale_id: saleId, weight: 5 }), 
        });

        if (response.ok) {
          setFavorites(prev => new Set(prev).add(saleId));
          setRefreshTrigger(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-xl font-bold mb-6">Des millions de petites annonces et autant d'occasions de se faire plaisir</h2>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lbc-orange"></div>
        </div>
      )}
      
      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sales.map((sale) => {
            const isFavorite = favorites.has(sale.id);

            return (
            <div 
              key={sale.id} 
              onClick={() => navigate(`/sales/${sale.id}`)}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col group relative"
            >
              
              <div className="relative bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center text-gray-400 font-medium">
                Aucune image
                
                <button
                  onClick={(e) => handleFavorite(e, sale.id)}
                  className={`absolute top-2 right-2 p-2 rounded-full shadow-sm transition-colors z-10 ${
                    isFavorite 
                      ? 'bg-red-50 text-red-500' 
                      : 'bg-white/80 hover:bg-white text-gray-400 hover:text-red-500'
                  }`}
                  title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  {isFavorite ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                  )}
                </button>
              </div>
              
              <div className="flex flex-col flex-grow">
                <h3 className="font-bold line-clamp-2 mb-1" title={sale.title}>{sale.title}</h3>
                <p className="text-lbc-orange font-bold text-lg mb-2">{sale.price} €</p>
                
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded font-medium">{sale.categorie}</span>
                  <span className="flex items-center gap-1 font-medium">
                    ⭐ {sale.seller_rating}/5
                  </span>
                </div>
              </div>
              
            </div>
          )})}
        </div>
      )}
    </main>
  );
}