import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    birthday: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Créer un compte</h2>
        
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm text-center">
            Compte créé avec succès ! Redirection...
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="firstname">Prénom</label>
              <input id="firstname" type="text" value={formData.firstname} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="lastname">Nom</label>
              <input id="lastname" type="text" value={formData.lastname} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
            <input id="email" type="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" required />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">Mot de passe</label>
            <input id="password" type="password" value={formData.password} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" required />
            <p className="text-xs text-gray-500 mt-1">12 caractères min, majuscule, minuscule, chiffre et caractère spécial.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="birthday">Date de naissance</label>
              <input id="birthday" type="date" value={formData.birthday} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="phone">Téléphone</label>
              <input id="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" required />
            </div>
          </div>

          <button type="submit" className="w-full bg-lbc-orange hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors mt-6">
            S'inscrire
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Déjà un compte ? <Link to="/login" className="text-lbc-blue font-bold hover:underline">Se connecter</Link>
        </p>
      </div>
    </main>
  );
}