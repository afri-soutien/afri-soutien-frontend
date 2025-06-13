import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  User, 
  Heart,
  AlertCircle
} from "lucide-react";

const orderSchema = z.object({
  motivationMessage: z.string().min(10, "Veuillez expliquer votre besoin (minimum 10 caractères)"),
});

type OrderForm = z.infer<typeof orderSchema>;

export default function BoutiqueItemDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const form = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      motivationMessage: "",
    },
  });

  // Fetch boutique item details
  const { data: item, isLoading, error } = useQuery({
    queryKey: [`/api/boutique/items/${id}`],
  });

  const handleOrderSubmit = async (data: OrderForm) => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/boutique/orders", {
        itemId: parseInt(id!),
        motivationMessage: data.motivationMessage,
      });

      toast({
        title: "Demande envoyée",
        description: "Votre demande a été transmise aux administrateurs pour validation.",
      });

      setIsOrderModalOpen(false);
      form.reset();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Article non trouvé</h2>
              <p className="text-gray-600 mb-4">Cet article n'existe pas ou n'est plus disponible.</p>
              <Link href="/boutique">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la boutique
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/boutique">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la boutique
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {item.imageUrls && item.imageUrls.length > 0 ? (
                <img
                  src={item.imageUrls[0]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{item.category}</Badge>
                <Badge 
                  variant={item.status === 'available' ? 'default' : 'destructive'}
                >
                  {item.status === 'available' ? 'Disponible' : 'Non disponible'}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
              <p className="text-gray-700 text-lg leading-relaxed">{item.description}</p>
            </div>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Publié le {new Date(item.publishedAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Vérifié par l'équipe Afri Soutien</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Button */}
            {item.status === 'available' && (
              <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full">
                    <Heart className="h-5 w-5 mr-2" />
                    Demander cet article
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Demander cet article</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleOrderSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="motivationMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pourquoi avez-vous besoin de cet article ?</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Expliquez brièvement pourquoi cet article vous serait utile..."
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setIsOrderModalOpen(false)}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Envoi..." : "Envoyer la demande"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}

            {item.status !== 'available' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-center">
                  Cet article n'est plus disponible
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}