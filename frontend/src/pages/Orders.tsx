import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';

interface SaleItem {
  id: string;
  title: string;
  price: number;
}

interface Command {
  id: string;
  date: string;
  status: string;
  sale: { sale: SaleItem }[];
}

export default function Orders() {
  const { token, isAuthenticated } = useAuth();
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchCommands = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/commands', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erreur lors du chargement des commandes');
        
        const data = await response.json();
        setCommands(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommands();
  }, [token]);

  const updateStatus = async (commandId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/commands/${commandId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      setCommands(prev => prev.map(cmd => 
        cmd.id === commandId ? { ...cmd, status: newStatus } : cmd
      ));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En cours': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Expédiée': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Livrée': return 'bg-green-100 text-green-700 border-green-200';
      case 'Annulée': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Mes Achats</h2>

      {loading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lbc-orange mx-auto mt-12"></div>}
      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>}

      {!loading && commands.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500 mb-4">Vous n'avez pas encore passé de commande.</p>
          <Link to="/" className="text-lbc-orange font-bold hover:underline">Découvrir les annonces</Link>
        </div>
      )}

      <div className="space-y-4">
        {commands.map((cmd) => {
          const item = cmd.sale?.[0]?.sale;
          if (!item) return null;

          return (
            <div key={cmd.id} className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-100">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(cmd.status)}`}>
                    {cmd.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Le {new Date(cmd.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <Link to={`/sales/${item.id}`} className="text-lg font-bold hover:text-lbc-blue transition-colors line-clamp-1">
                  {item.title}
                </Link>
                <p className="text-lbc-orange font-black mt-1">{item.price} €</p>
                <p className="text-xs text-gray-400 mt-2 font-mono">N° {cmd.id}</p>
              </div>

              <div className="flex flex-wrap gap-2 md:flex-col justify-center">
                {cmd.status === 'En cours' && (
                  <button 
                    onClick={() => updateStatus(cmd.id, 'Annulée')}
                    className="px-4 py-2 bg-white border border-red-500 text-red-500 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors"
                  >
                    Annuler l'achat
                  </button>
                )}
                {(cmd.status === 'En cours' || cmd.status === 'Expédiée') && (
                  <button 
                    onClick={() => updateStatus(cmd.id, 'Livrée')}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold transition-colors"
                  >
                    Marquer comme Livrée
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}