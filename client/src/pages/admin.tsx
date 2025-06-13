import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  Users, 
  Store, 
  Eye,
  Check,
  X,
  AlertTriangle,
  Package,
  User,
  Calendar,
  MapPin,
  Mail,
  Phone,
  ShoppingBag,
  Heart,
  TrendingUp,
  FileText,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";

const publishItemSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  category: z.string().min(1, "Veuillez sélectionner une catégorie"),
});

type PublishItemForm = z.infer<typeof publishItemSchema>;

export default function Admin() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("campaigns");
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PublishItemForm>({
    resolver: zodResolver(publishItemSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
    },
  });

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    setLocation("/");
    return null;
  }

  // Fetch admin data
  const { data: pendingCampaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/admin/campaigns/pending"],
  });

  const { data: pendingDonations = [], isLoading: donationsLoading } = useQuery({
    queryKey: ["/api/admin/material-donations/pending"],
  });

  const { data: pendingOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/admin/boutique/orders/pending"],
  });

  // Campaign approval mutation
  const approveCampaignMutation = useMutation({
    mutationFn: async ({ campaignId, status }: { campaignId: number; status: string }) => {
      return await apiRequest("PUT", `/api/admin/campaigns/${campaignId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns/pending"] });
      toast({
        title: "Campagne mise à jour",
        description: "Le statut de la campagne a été modifié avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour.",
        variant: "destructive",
      });
    },
  });

  // Material donation publication mutation
  const publishDonationMutation = useMutation({
    mutationFn: async (data: { donationId: number; title: string; description: string; category: string }) => {
      return await apiRequest("POST", `/api/admin/material-donations/${data.donationId}/publish`, {
        title: data.title,
        description: data.description,
        category: data.category,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/material-donations/pending"] });
      setIsPublishModalOpen(false);
      setSelectedDonation(null);
      form.reset();
      toast({
        title: "Article publié",
        description: "L'article a été ajouté à la boutique solidaire.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication.",
        variant: "destructive",
      });
    },
  });

  // Order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return await apiRequest("PUT", `/api/admin/boutique/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/boutique/orders/pending"] });
      toast({
        title: "Commande mise à jour",
        description: "Le statut de la commande a été modifié avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour.",
        variant: "destructive",
      });
    },
  });

  const handleApproveCampaign = (campaignId: number) => {
    approveCampaignMutation.mutate({ campaignId, status: "approved" });
  };

  const handleRejectCampaign = (campaignId: number) => {
    approveCampaignMutation.mutate({ campaignId, status: "rejected" });
  };

  const handlePublishDonation = (donation: any) => {
    setSelectedDonation(donation);
    form.setValue("title", donation.title);
    form.setValue("description", donation.description);
    form.setValue("category", donation.category || "");
    setIsPublishModalOpen(true);
  };

  const handleRejectDonation = async (donationId: number) => {
    try {
      await apiRequest("PUT", `/api/admin/material-donations/${donationId}/status`, { status: "rejected" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/material-donations/pending"] });
      toast({
        title: "Don rejeté",
        description: "Le don matériel a été rejeté.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du rejet.",
        variant: "destructive",
      });
    }
  };

  const onSubmitPublish = async (data: PublishItemForm) => {
    if (!selectedDonation) return;

    setIsSubmitting(true);
    try {
      await publishDonationMutation.mutateAsync({
        donationId: selectedDonation.id,
        title: data.title,
        description: data.description,
        category: data.category,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveOrder = (orderId: number) => {
    updateOrderMutation.mutate({ orderId, status: "approved" });
  };

  const handleRejectOrder = (orderId: number) => {
    updateOrderMutation.mutate({ orderId, status: "rejected" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
      case "pending_verification":
      case "pending_approval":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Terminé</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Calculate stats
  const totalPendingCampaigns = pendingCampaigns.length;
  const totalPendingDonations = pendingDonations.length;
  const totalPendingOrders = pendingOrders.length;
  const totalPendingItems = totalPendingCampaigns + totalPendingDonations + totalPendingOrders;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-neutral mb-2">Administration</h1>
              <p className="text-gray-600">
                Gestion de la plateforme Afri Soutien
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-red-100 text-red-800">
                <Shield className="w-3 h-3 mr-1" />
                Administrateur
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cagnottes en attente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPendingCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                À valider
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dons matériels</CardTitle>
              <Package className="h-4 w-4 text-trust" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPendingDonations}</div>
              <p className="text-xs text-muted-foreground">
                À vérifier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demandes boutique</CardTitle>
              <ShoppingBag className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                À traiter
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total en attente</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPendingItems}</div>
              <p className="text-xs text-muted-foreground">
                Actions requises
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campaigns">
              Cagnottes
              {totalPendingCampaigns > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-white text-xs">
                  {totalPendingCampaigns}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="donations">
              Dons Matériels
              {totalPendingDonations > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-white text-xs">
                  {totalPendingDonations}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="orders">
              Commandes
              {totalPendingOrders > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-white text-xs">
                  {totalPendingOrders}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Cagnottes en Attente d'Approbation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse border rounded-lg p-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                ) : pendingCampaigns.length > 0 ? (
                  <div className="space-y-4">
                    {pendingCampaigns.map((campaign: any) => (
                      <div key={campaign.id} className="border rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{campaign.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                              {campaign.description}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Créateur:</span>
                                <p className="font-medium">Utilisateur #{campaign.userId}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Objectif:</span>
                                <p className="font-medium">{formatAmount(campaign.goalAmount)}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Catégorie:</span>
                                <p className="font-medium">{campaign.category || "Non spécifiée"}</p>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            {getStatusBadge(campaign.status)}
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(campaign.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/campaigns/${campaign.id}`, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApproveCampaign(campaign.id)}
                            disabled={approveCampaignMutation.isPending}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approuver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRejectCampaign(campaign.id)}
                            disabled={approveCampaignMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune cagnotte en attente</h3>
                    <p className="text-gray-600">
                      Toutes les cagnottes ont été traitées.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Material Donations Tab */}
          <TabsContent value="donations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Dons Matériels à Vérifier
                </CardTitle>
              </CardHeader>
              <CardContent>
                {donationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="animate-pulse border rounded-lg p-6">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-20 bg-gray-200 rounded mb-4"></div>
                      </div>
                    ))}
                  </div>
                ) : pendingDonations.length > 0 ? (
                  <div className="space-y-6">
                    {pendingDonations.map((donation: any) => (
                      <div key={donation.id} className="border rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{donation.title}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                              <div>
                                <span className="text-gray-500">Donateur:</span>
                                <p className="font-medium">{donation.donorName}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Contact:</span>
                                <p className="font-medium">{donation.donorContact}</p>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            {getStatusBadge(donation.status)}
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(donation.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-gray-700 leading-relaxed">{donation.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-500">Lieu de récupération:</span>
                            <p className="font-medium flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {donation.pickupLocation}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Catégorie:</span>
                            <p className="font-medium">{donation.category || "Non spécifiée"}</p>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handlePublishDonation(donation)}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Vérifier et publier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRejectDonation(donation.id)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun don matériel en attente</h3>
                    <p className="text-gray-600">
                      Tous les dons matériels ont été traités.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Demandes d'Articles en Attente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse border rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pendingOrders.length > 0 ? (
                  <div className="space-y-4">
                    {pendingOrders.map((order: any) => (
                      <div key={order.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">Article demandé</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                                <div>
                                  <span className="text-gray-500">Demandeur:</span>
                                  <p className="font-medium">Utilisateur #{order.userId}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Date:</span>
                                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                                </div>
                              </div>
                              {order.motivationMessage && (
                                <div className="mb-3">
                                  <span className="text-gray-500">Motivation:</span>
                                  <p className="text-gray-700 italic">"{order.motivationMessage}"</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            {getStatusBadge(order.status)}
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApproveOrder(order.id)}
                            disabled={updateOrderMutation.isPending}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approuver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRejectOrder(order.id)}
                            disabled={updateOrderMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune commande en attente</h3>
                    <p className="text-gray-600">
                      Toutes les commandes ont été traitées.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Gestion des Utilisateurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Gestion des utilisateurs</h3>
                  <p className="text-gray-600">
                    Cette fonctionnalité sera disponible prochainement pour gérer les comptes utilisateurs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Publish Item Modal */}
      <Dialog open={isPublishModalOpen} onOpenChange={setIsPublishModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Publier dans la boutique</DialogTitle>
          </DialogHeader>

          {selectedDonation && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitPublish)} className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-1">Don de: {selectedDonation.donorName}</h4>
                  <p className="text-sm text-gray-600">{selectedDonation.description}</p>
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre pour la boutique</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre de l'article" {...field} />
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
                      <FormLabel>Description pour la boutique</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description de l'article..."
                          rows={3}
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
                          <SelectItem value="Électronique">Électronique</SelectItem>
                          <SelectItem value="Vêtements">Vêtements</SelectItem>
                          <SelectItem value="Mobilier">Mobilier</SelectItem>
                          <SelectItem value="Éducation">Éducation</SelectItem>
                          <SelectItem value="Jouets">Jouets</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
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
                    onClick={() => setIsPublishModalOpen(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="bg-secondary hover:bg-green-700 flex-1"
                    disabled={isSubmitting || publishDonationMutation.isPending}
                  >
                    {isSubmitting || publishDonationMutation.isPending ? "Publication..." : "Publier"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
