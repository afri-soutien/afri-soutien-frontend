import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import BoutiqueItem from "@/components/boutique-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Package, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

export default function Boutique() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [motivationMessage, setMotivationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // Fetch boutique items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["/api/boutique/items", { status: "available", category: categoryFilter !== "all" ? categoryFilter : undefined }],
    queryFn: async () => {
      const params = new URLSearchParams({ status: "available" });
      if (categoryFilter !== "all") {
        params.append("category", categoryFilter);
      }
      const response = await fetch(`/api/boutique/items?${params}`);
      if (!response.ok) throw new Error("Failed to fetch items");
      return response.json();
    }
  });

  const handleRequestItem = (itemId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour demander un article.",
        variant: "destructive",
      });
      return;
    }

    const item = items.find((i: any) => i.id === itemId);
    if (item) {
      setSelectedItem(item);
      setIsRequestModalOpen(true);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/boutique/orders", {
        itemId: selectedItem.id,
        motivationMessage: motivationMessage.trim() || undefined,
      });

      toast({
        title: "Demande envoyée",
        description: "Votre demande a été transmise aux administrateurs pour validation.",
      });

      setIsRequestModalOpen(false);
      setMotivationMessage("");
      setSelectedItem(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre demande.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter items based on search term
  const filteredItems = items.filter((item: any) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { value: "all", label: "Tout voir" },
    { value: "Électronique", label: "Électronique", icon: "💻" },
    { value: "Vêtements", label: "Vêtements", icon: "👕" },
    { value: "Mobilier", label: "Mobilier", icon: "🪑" },
    { value: "Éducation", label: "Éducation", icon: "📚" },
    { value: "Jouets", label: "Jouets", icon: "🧸" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral mb-4">Boutique Solidaire</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Des articles donnés par la communauté, vérifiés et mis à disposition gratuitement 
            pour les bénéficiaires vérifiés
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un article..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-64">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <span className="flex items-center">
                        {category.icon && <span className="mr-2">{category.icon}</span>}
                        {category.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={categoryFilter === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(category.value)}
              className={categoryFilter === category.value ? "bg-primary hover:bg-orange-700" : ""}
            >
              {category.icon && <span className="mr-2">{category.icon}</span>}
              {category.label}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {filteredItems.length} article{filteredItems.length > 1 ? "s" : ""} disponible
            {filteredItems.length > 1 ? "s" : ""}
          </p>
          
          {!isAuthenticated && (
            <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <ShoppingBag className="inline w-4 h-4 mr-1" />
              <Link href="/login" className="text-primary hover:underline">
                Connectez-vous
              </Link>{" "}
              pour demander des articles
            </div>
          )}
        </div>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item: any) => (
              <BoutiqueItem
                key={item.id}
                item={item}
                onRequest={handleRequestItem}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Package className="text-gray-400 w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun article trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || categoryFilter !== "all"
                ? "Essayez de modifier vos critères de recherche."
                : "Aucun article n'est actuellement disponible dans la boutique."
              }
            </p>
            {(searchTerm || categoryFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                }}
              >
                Afficher tous les articles
              </Button>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-primary rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Vous avez des objets à donner ?</h2>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            Proposez vos objets en bon état pour qu'ils puissent aider d'autres personnes 
            dans le besoin. Notre équipe se charge de tout vérifier et organiser la récupération.
          </p>
          <Button
            asChild
            variant="secondary"
            className="bg-white text-primary hover:bg-gray-100"
          >
            <Link href="/donate-material">Proposer un don matériel</Link>
          </Button>
        </div>
      </div>

      {/* Request Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Demander cet article</DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <form onSubmit={handleSubmitRequest} className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-1">{selectedItem.title}</h4>
                <p className="text-sm text-gray-600">{selectedItem.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Catégorie: {selectedItem.category}
                </p>
              </div>

              <div>
                <Label htmlFor="motivation">
                  Message de motivation (optionnel)
                </Label>
                <Textarea
                  id="motivation"
                  placeholder="Expliquez pourquoi vous avez besoin de cet article..."
                  value={motivationMessage}
                  onChange={(e) => setMotivationMessage(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Un message personnel peut aider les administrateurs à traiter votre demande.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Processus de validation :</strong> Votre demande sera examinée par notre équipe. 
                  Vous recevrez une notification par email une fois la décision prise.
                </p>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-secondary hover:bg-green-700 flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi..." : "Envoyer la demande"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
