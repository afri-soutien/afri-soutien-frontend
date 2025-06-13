import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import CampaignCard from "@/components/campaign-card";
import BoutiqueItem from "@/components/boutique-item";
import DonationModal from "@/components/donation-modal";
import { Button } from "@/components/ui/button";
import { Heart, Users, Shield, Truck, Store, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const { toast } = useToast();

  // Fetch featured campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ["/api/campaigns?limit=4"],
  });

  // Fetch boutique items
  const { data: boutiqueItems = [] } = useQuery({
    queryKey: ["/api/boutique/items?limit=4"],
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-orange-700 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-header text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                La Solidarité <span className="text-accent">Connectée</span>
              </h1>
              <p className="text-xl mb-8 text-orange-100">
                Connectons directement votre générosité aux besoins vérifiés des bénéficiaires.
                Transparence, confiance et impact réel au cœur de l'entraide africaine.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  className="bg-white text-primary hover:bg-gray-100 px-8 py-3"
                >
                  <Link href="/dashboard">Créer une cagnotte</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3"
                >
                  <Link href="/campaigns">Faire un don</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-orange-600 rounded-2xl overflow-hidden flex items-center justify-center">
                <Users className="text-white w-32 h-32 opacity-30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">1,234</div>
              <div className="text-gray-600">Cagnottes actives</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">856M</div>
              <div className="text-gray-600">CFA collectés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">2,891</div>
              <div className="text-gray-600">Dons matériels</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-trust mb-2">98%</div>
              <div className="text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="font-header text-3xl font-bold text-neutral mb-3">
                Cagnottes en cours
              </h2>
              <p className="text-gray-600">
                Soutenez des causes vérifiées qui ont besoin de votre aide
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/campaigns">Voir tout</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign: any) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onDonate={handleDonate}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Boutique Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="font-header text-3xl font-bold text-neutral mb-3">
                Boutique Solidaire
              </h2>
              <p className="text-gray-600">
                Objets donnés par la communauté, vérifiés et mis à disposition gratuitement
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/boutique">Voir tout</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {boutiqueItems.map((item: any) => (
              <BoutiqueItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-header text-3xl font-bold text-neutral mb-4">
              Comment ça marche
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un processus simple et transparent pour donner et recevoir de l'aide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-primary w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">1. Créer ou Découvrir</h3>
              <p className="text-gray-600">
                Créez votre cagnotte ou découvrez des causes qui vous touchent.
                Toutes les campagnes sont vérifiées par notre équipe.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-secondary w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">2. Donner Facilement</h3>
              <p className="text-gray-600">
                Utilisez Wave, Orange Money ou votre opérateur mobile préféré
                pour faire un don en quelques clics.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-trust/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-trust w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">3. Suivre l'Impact</h3>
              <p className="text-gray-600">
                Recevez des mises à jour régulières et voyez concrètement
                l'impact de votre générosité sur la communauté.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-orange-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Rejoignez le mouvement de solidarité</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Que vous souhaitiez donner ou recevoir de l'aide, Afri Soutien vous connecte
            à une communauté bienveillante et engagée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-white text-primary hover:bg-gray-100 px-8 py-4"
            >
              <Link href="/register">Créer un compte</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4"
            >
              <Link href="/donate-material">Faire un don matériel</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Heart className="text-white w-4 h-4" />
                </div>
                <span className="font-header font-bold text-xl">Afri Soutien</span>
              </div>
              <p className="text-gray-300 mb-4">
                La plateforme de solidarité qui connecte directement votre générosité
                aux besoins vérifiés.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Plateforme</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/campaigns" className="hover:text-white transition-colors">
                    Cagnottes
                  </Link>
                </li>
                <li>
                  <Link href="/boutique" className="hover:text-white transition-colors">
                    Boutique solidaire
                  </Link>
                </li>
                <li>
                  <Link href="/donate-material" className="hover:text-white transition-colors">
                    Faire un don
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Centre d'aide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Légal</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Conditions d'utilisation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Politique de confidentialité
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Mentions légales
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Afri Soutien. Tous droits réservés. Fait avec ❤️ pour l'Afrique.</p>
          </div>
        </div>
      </footer>

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
