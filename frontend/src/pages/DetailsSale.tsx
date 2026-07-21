import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Sale {
  id: string;
  title: string;
  price: number;
  description: string | null;
  categorie: string;
  seller_rating: number;
  wear_level: number;
  user_id: string;
  created_at: string;
}

export default function DetailsSale() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
      } catch (e) {
        console.error("Erreur de décodage du token");
      }
    }

    const fetchSale = async () => {
      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`http://localhost:3000/api/sales/${id}`, { headers });
        if (!response.ok) throw new Error("Impossible de charger l'annonce");
        
        setSale(await response.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, [id, token]);

  const handleDelete = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette annonce ?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/sales/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok || response.status === 204) {
        navigate('/');
      } else {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBuy = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/commands', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ sale_id: id })
      });

      if (response.ok) {
        alert("Commande passée avec succès !");
        navigate('/');
      } else {
        throw new Error("Erreur lors de la commande");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lbc-orange"></div></div>;
  if (error || !sale) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="bg-red-100 text-red-700 p-4 rounded-lg">{error || "Annonce introuvable"}</div></div>;

  const isOwner = currentUserId === sale.user_id;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold">{sale.title}</h1>
          <span className="text-3xl font-black text-lbc-orange">{sale.price} €</span>
        </div>

        <div className="bg-gray-200 h-64 rounded-lg mb-6 flex items-center justify-center text-gray-500 font-medium text-lg">
          Aucune image
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <p><strong>Catégorie :</strong> {sale.categorie}</p>
          <p><strong>Note vendeur :</strong> ⭐ {sale.seller_rating}/5</p>
          <p><strong>Usure :</strong> {sale.wear_level}/5</p>
          <p><strong>Publiée le :</strong> {new Date(sale.created_at).toLocaleDateString('fr-FR')}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{sale.description || "Aucune description fournie."}</p>
        </div>

        <div className="flex gap-4 border-t pt-6">
          {!isOwner ? (
            <button onClick={handleBuy} className="flex-1 bg-lbc-orange hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors">
              Acheter ({sale.price} €)
            </button>
          ) : (
            <>
              <Link to={`/sales/${sale.id}/edit`} className="flex-1 bg-lbc-blue hover:bg-blue-800 text-white text-center font-bold py-3 rounded-lg transition-colors">
                Modifier l'annonce
              </Link>
              <button onClick={handleDelete} className="flex-1 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 font-bold py-3 rounded-lg transition-colors">
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}