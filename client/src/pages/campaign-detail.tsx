import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Navbar from "@/components/navbar";
import DonationModal from "@/components/donation-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Users, Calendar, MapPin, Share2, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function CampaignDetail() {
  const { id } = useParams();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const { toast } = useToast();

  // Fetch campaign details
  const { data: campaign, isLoading } = useQuery({
    queryKey: [`/api/campaigns/${id}`],
    enabled: !!id,
  });

  const handleDonationSubmit = async (donationData: any) => {
    try {
      await apiRequest("POST", "/api/donations/initiate", donationData);
      toast({
        title: "Don initié avec succès",
        description: "Vous recevrez une notification pour confirmer le paiement.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'initiation du don.",
        variant: "destructive",
      });
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Campagne non trouvée
            </h1>
            <p className="text-gray-600">
              Cette campagne n'existe pas ou a été supprimée.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const goal = parseFloat(campaign.goalAmount);
  const current = parseFloat(campaign.currentAmount);
  const progressPercentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'medical':
        return 'bg-red-100 text-red-800';
      case 'education':
        return 'bg-blue-100 text-blue-800';
      case 'business':
        return 'bg-green-100 text-green-800';
      case 'emergency':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge className="bg-trust text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Vérifié
            </Badge>
            {campaign.category && (
              <Badge className={getCategoryColor(campaign.category)}>
                {campaign.category}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold text-neutral mb-4">{campaign.title}</h1>

          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Créée le {formatDate(campaign.createdAt)}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              150 donateurs
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Collecté</span>
              <span>{progressPercentage.toFixed(1)}% de l'objectif</span>
            </div>
            
            <Progress value={progressPercentage} className="h-3 mb-3" />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-secondary">
                  {formatAmount(current)}
                </div>
                <div className="text-sm text-gray-600">collectés</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral">
                  {formatAmount(goal)}
                </div>
                <div className="text-sm text-gray-600">objectif</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              className="bg-primary hover:bg-orange-700 flex-1"
              onClick={() => setIsDonationModalOpen(true)}
            >
              Faire un don maintenant
            </Button>
            <Button variant="outline" className="flex items-center">
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>
            <Button variant="outline" className="flex items-center text-gray-600">
              <Flag className="w-4 h-4 mr-2" />
              Signaler
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-xl font-semibold mb-4">Description de la campagne</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {campaign.description}
                </p>
              </div>

              <Separator className="my-8" />

              <h3 className="text-lg font-semibold mb-4">Mises à jour</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium">Mise à jour</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(campaign.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Merci à tous pour votre soutien ! Nous avons déjà collecté plus de la moitié 
                    de notre objectif. Votre générosité nous touche énormément.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Créateur de la campagne</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Users className="text-white w-6 h-6" />
                </div>
                <div>
                  <div className="font-medium">Utilisateur Vérifié</div>
                  <div className="text-sm text-gray-600">Membre depuis 2023</div>
                </div>
              </div>
            </div>

            {/* Recent Donations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Donations récentes</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">Don anonyme</div>
                    <div className="text-xs text-gray-500">Il y a 2 heures</div>
                  </div>
                  <div className="font-semibold text-secondary">
                    {formatAmount(25000)}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">Marie K.</div>
                    <div className="text-xs text-gray-500">Il y a 5 heures</div>
                  </div>
                  <div className="font-semibold text-secondary">
                    {formatAmount(10000)}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">Jean D.</div>
                    <div className="text-xs text-gray-500">Il y a 1 jour</div>
                  </div>
                  <div className="font-semibold text-secondary">
                    {formatAmount(50000)}
                  </div>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Partager cette campagne</h3>
              <p className="text-sm text-gray-600 mb-4">
                Aidez à faire connaître cette cause en partageant avec vos proches.
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">📧</span>
                  Partager par email
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">📱</span>
                  Partager par WhatsApp
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">📋</span>
                  Copier le lien
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        campaign={campaign}
        onSubmit={handleDonationSubmit}
      />
    </div>
  );
}
