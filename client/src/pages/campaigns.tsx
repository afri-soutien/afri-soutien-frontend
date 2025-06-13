import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import CampaignCard from "@/components/campaign-card";
import DonationModal from "@/components/donation-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Plus } from "lucide-react";
import { Link } from "wouter";

export default function Campaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch campaigns
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  const handleDonate = (campaignId: number) => {
    const campaign = campaigns.find((c: any) => c.id === campaignId);
    if (campaign) {
      setSelectedCampaign(campaign);
      setIsDonationModalOpen(true);
    }
  };

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

  // Filter and sort campaigns
  const filteredCampaigns = campaigns
    .filter((campaign: any) => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || campaign.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "progress":
          const progressA = (parseFloat(a.currentAmount) / parseFloat(a.goalAmount)) * 100;
          const progressB = (parseFloat(b.currentAmount) / parseFloat(b.goalAmount)) * 100;
          return progressB - progressA;
        case "amount":
          return parseFloat(b.currentAmount) - parseFloat(a.currentAmount);
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-2 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-neutral mb-2">Toutes les Cagnottes</h1>
            <p className="text-gray-600">
              Découvrez {campaigns.length} causes vérifiées qui ont besoin de votre soutien
            </p>
          </div>
          {isAuthenticated && (
            <Button asChild className="bg-primary hover:bg-orange-700">
              <Link href="/dashboard">
                <Plus className="w-4 h-4 mr-2" />
                Créer une cagnotte
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="font-semibold mb-4">Filtrer les cagnottes</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Titre ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="medical">Médical</SelectItem>
                  <SelectItem value="education">Éducation</SelectItem>
                  <SelectItem value="business">Entreprise</SelectItem>
                  <SelectItem value="emergency">Urgence</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trier par
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récentes</SelectItem>
                  <SelectItem value="progress">Progression</SelectItem>
                  <SelectItem value="amount">Montant collecté</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                  setSortBy("recent");
                }}
                className="w-full"
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {filteredCampaigns.length} campagne{filteredCampaigns.length > 1 ? "s" : ""} trouvée
            {filteredCampaigns.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Campaigns Grid */}
        {filteredCampaigns.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign: any) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onDonate={handleDonate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400 w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune campagne trouvée
            </h3>
            <p className="text-gray-600 mb-4">
              Essayez de modifier vos critères de recherche ou de supprimer les filtres.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setSortBy("recent");
              }}
            >
              Afficher toutes les campagnes
            </Button>
          </div>
        )}
      </div>

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        campaign={selectedCampaign}
        onSubmit={handleDonationSubmit}
      />
    </div>
  );
}
