import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

interface BoutiqueItemProps {
  item: {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    publishedAt: string;
  };
  onRequest?: (itemId: number) => void;
}

export default function BoutiqueItem({ item, onRequest }: BoutiqueItemProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
      case 'reserved':
        return <Badge className="bg-orange-100 text-orange-800">Réservé</Badge>;
      case 'claimed':
        return <Badge className="bg-gray-100 text-gray-800">Récupéré</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'électronique':
        return '💻';
      case 'vêtements':
        return '👕';
      case 'mobilier':
        return '🪑';
      case 'éducation':
        return '📚';
      case 'jouets':
        return '🧸';
      default:
        return '📦';
    }
  };

  const isAvailable = item.status === 'available';

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
      {/* Placeholder for image */}
      <div className="w-full h-48 bg-gray-100 rounded-t-xl overflow-hidden flex items-center justify-center">
        <span className="text-4xl">{getCategoryIcon(item.category)}</span>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          {getStatusBadge(item.status)}
          <span className="text-xs text-gray-500">{item.category}</span>
        </div>

        <h3 className="font-semibold text-neutral mb-2">{item.title}</h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center text-xs text-gray-500 mb-3">
          <MapPin className="w-3 h-3 mr-1" />
          <span>Abidjan</span>
        </div>

        <Button
          className={`w-full text-sm font-medium ${
            isAvailable
              ? 'bg-secondary hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isAvailable}
          onClick={() => isAvailable && onRequest?.(item.id)}
        >
          {isAvailable ? 'Demander cet objet' : 'Non disponible'}
        </Button>
      </div>
    </div>
  );
}
