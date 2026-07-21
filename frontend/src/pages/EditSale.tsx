import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = ['Informatique', 'Sport', 'Animaux', 'Service', 'Livre', 'Cuisine', 'Vêtement', 'Jeux Vidéo', 'Fourniture'];

export default function EditSale() {
  const { id } = useParams<{ id: string }>();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '', price: '', description: '', quantity: '1', categorie: CATEGORIES[0], wear_level: '0'
  });

  useEffect(() => {
    if (!token) return;

    const fetchSale = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/sales/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Annonce introuvable");
        
        const data = await response.json();
        setFormData({
          title: data.title,
          price: data.price.toString(),
          description: data.description || '',
          quantity: data.quantity.toString(),
          categorie: data.categorie,
          wear_level: data.wear_level.toString()
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`http://localhost:3000/api/sales/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          wear_level: Number(formData.wear_level)
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la modification");
      }

      navigate(`/sales/${id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lbc-orange"></div></div>;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Modifier l'annonce</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre de l'annonce</label>
            <input type="text" required
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-lbc-orange"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prix (€)</label>
              <input type="number" min="0" required
                value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Catégorie</label>
              <select 
                value={formData.categorie} onChange={e => setFormData({...formData, categorie: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea rows={4}
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quantité</label>
              <input type="number" min="1" required
                value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Niveau d'usure (0=Neuf, 5=Usé)</label>
              <input type="number" min="0" max="5" required
                value={formData.wear_level} onChange={e => setFormData({...formData, wear_level: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-lbc-blue hover:bg-blue-800 text-white font-bold py-3 rounded-lg mt-6 transition-colors">
            Enregistrer les modifications
          </button>
        </form>
      </div>
    </main>
  );
}