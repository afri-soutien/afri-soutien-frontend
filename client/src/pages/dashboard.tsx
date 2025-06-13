import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User, 
  Plus, 
  Heart, 
  ShoppingBag, 
  Gift, 
  TrendingUp, 
  Calendar,
  Eye,
  Edit,
  Package,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

const campaignSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  goalAmount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, "Montant invalide"),
  category: z.string().min(1, "Veuillez sélectionner une catégorie"),
});

type CampaignForm = z.infer<typeof campaignSchema>;

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const form = useForm<CampaignForm>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      description: "",
      goalAmount: "",
      category: "",
    },
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Fetch user campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/users/me/campaigns"],
  });

  // Fetch user orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/users/me/orders"],
  });

  const handleCreateCampaign = async (data: CampaignForm) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/campaigns", {
        title: data.title,
        description: data.description,
        goalAmount: parseFloat(data.goalAmount),
        category: data.category,
      });

      toast({
        title: "Cagnotte créée",
        description: "Votre cagnotte a été soumise pour validation.",
      });

      setIsCreateModalOpen(false);
      form.reset();
      
      // Refresh campaigns
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAmount = (amount: string | number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Terminé</Badge>;
      case "pending_approval":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "pending_approval":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>;
      case "delivered":
        return <Badge className="bg-blue-100 text-blue-800">Livré</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Annulé</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Calculate user stats
  const totalCampaigns = campaigns.length;
  const totalRaised = campaigns.reduce((sum: number, campaign: any) => 
    sum + parseFloat(campaign.currentAmount || "0"), 0
  );
  const totalOrders = orders.length;
  const activeCampaigns = campaigns.filter((c: any) => c.status === "approved").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-neutral mb-2">Tableau de bord</h1>
              <p className="text-gray-600">
                Bienvenue, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
              {user?.isVerified && (
                <Badge className="bg-trust text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Vérifié
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mes Cagnottes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                {activeCampaigns} active{activeCampaigns > 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fonds Collectés</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(totalRaised)}</div>
              <p className="text-xs text-muted-foreground">
                Total des donations reçues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demandes Boutique</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Articles demandés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions Rapides</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  className="w-full bg-primary hover:bg-orange-700"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Nouvelle cagnotte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campaigns">Mes Cagnottes</TabsTrigger>
            <TabsTrigger value="orders">Mes Demandes</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Mes Cagnottes</h2>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle cagnotte
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Créer une nouvelle cagnotte</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreateCampaign)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Titre de la cagnotte</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Aide pour mes études" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Décrivez votre situation et vos besoins..."
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="goalAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Objectif (FCFA)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Ex: 500000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Catégorie</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez une catégorie" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="medical">Médical</SelectItem>
                                <SelectItem value="education">Éducation</SelectItem>
                                <SelectItem value="business">Entreprise</SelectItem>
                                <SelectItem value="emergency">Urgence</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateModalOpen(false)}
                          className="flex-1"
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          className="bg-primary hover:bg-orange-700 flex-1"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Création..." : "Créer"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {campaignsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-2 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map((campaign: any) => (
                  <Card key={campaign.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{campaign.title}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {campaign.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {getStatusBadge(campaign.status)}
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Objectif</p>
                          <p className="font-semibold">{formatAmount(campaign.goalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Collecté</p>
                          <p className="font-semibold text-secondary">
                            {formatAmount(campaign.currentAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Progression</p>
                          <p className="font-semibold">
                            {Math.round((parseFloat(campaign.currentAmount) / parseFloat(campaign.goalAmount)) * 100)}%
                          </p>
                        </div>
                      </div>

                      <Progress
                        value={(parseFloat(campaign.currentAmount) / parseFloat(campaign.goalAmount)) * 100}
                        className="mb-4"
                      />

                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Créée le {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                        {campaign.status === "approved" && (
                          <Link
                            href={`/campaigns/${campaign.id}`}
                            className="text-primary hover:underline"
                          >
                            Voir la page publique →
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Aucune cagnotte</h3>
                  <p className="text-gray-600 mb-6">
                    Vous n'avez pas encore créé de cagnotte. Commencez dès maintenant !
                  </p>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-primary hover:bg-orange-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer ma première cagnotte
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Mes Demandes d'Articles</h2>
              <Button asChild variant="outline">
                <Link href="/boutique">
                  <Package className="w-4 h-4 mr-2" />
                  Parcourir la boutique
                </Link>
              </Button>
            </div>

            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Article demandé</h3>
                            <p className="text-sm text-gray-600">
                              Demandé le {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                            {order.motivationMessage && (
                              <p className="text-sm text-gray-600 mt-1">
                                "{order.motivationMessage}"
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {getOrderStatusBadge(order.status)}
                          <p className="text-xs text-gray-500 mt-1">
                            {order.status === "pending_approval" && "En attente de validation"}
                            {order.status === "approved" && "Validé, en attente de livraison"}
                            {order.status === "delivered" && "Article livré"}
                            {order.status === "rejected" && "Demande rejetée"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Aucune demande</h3>
                  <p className="text-gray-600 mb-6">
                    Vous n'avez pas encore fait de demande d'articles. Découvrez la boutique solidaire !
                  </p>
                  <Button asChild className="bg-secondary hover:bg-green-700">
                    <Link href="/boutique">
                      <Package className="w-4 h-4 mr-2" />
                      Explorer la boutique
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations du profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <Input value={user?.firstName || ""} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <Input value={user?.lastName || ""} disabled />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <Input value={user?.email || ""} disabled />
                  <p className="text-xs text-gray-500 mt-1">
                    Pour modifier votre email, contactez le support
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut du compte
                  </label>
                  <div className="flex items-center space-x-2">
                    {user?.isVerified ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-600 font-medium">Compte vérifié</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="text-yellow-600 font-medium">
                          Vérification en attente
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membre depuis
                  </label>
                  <p className="text-gray-900">
                    {user?.createdAt ? 
                      new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) 
                      : "Date non disponible"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
