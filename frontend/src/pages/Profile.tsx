import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

export default function Profile() {
  const { token, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({
    firstname: '', lastname: '', phone: '', birthday: ''
  });

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erreur récupération profil');
        
        const data = await response.json();
        setFormData({
          firstname: data.firstname || '',
          lastname: data.lastname || '',
          phone: data.phone || '',
          birthday: data.birthday ? data.birthday.split('T')[0] : ''
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:3000/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erreur mise à jour');
      }

      setMessage({ text: 'Profil mis à jour avec succès !', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte définitivement ?")) return;

    try {
      const response = await fetch('http://localhost:3000/api/users/me', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        logout();
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (loading) return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lbc-orange mx-auto mt-12"></div>;

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Mon Profil</h2>

        {message.text && (
          <div className={`p-3 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4 mb-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prénom</label>
              <input type="text" value={formData.firstname} onChange={e => setFormData({...formData, firstname: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input type="text" value={formData.lastname} onChange={e => setFormData({...formData, lastname: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-3" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date de naissance</label>
            <input type="date" value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-3" />
          </div>

          <button type="submit" className="w-full bg-lbc-blue hover:bg-blue-800 text-white font-bold py-3 rounded-lg mt-4 transition-colors">
            Enregistrer les modifications
          </button>
        </form>

        <hr className="mb-8" />
        
        <div className="text-center">
          <button onClick={handleDelete} className="text-sm bg-white border border-red-200 hover:bg-red-50 text-red-600 font-medium py-2 px-4 rounded transition-colors">
            Supprimer mon compte
          </button>
        </div>
      </div>
    </main>
  );
}