import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CloudUpload, Search, Truck, Store, CheckCircle, Info } from "lucide-react";
import { useLocation } from "wouter";

const materialDonationSchema = z.object({
  donorName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  donorContact: z.string().min(5, "Veuillez fournir un contact valide"),
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  category: z.string().min(1, "Veuillez sélectionner une catégorie"),
  pickupLocation: z.string().min(5, "Veuillez préciser le lieu de récupération"),
  acceptTerms: z.boolean().refine(val => val === true, "Vous devez accepter les conditions"),
});

type MaterialDonationForm = z.infer<typeof materialDonationSchema>;

export default function MaterialDonation() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<MaterialDonationForm>({
    resolver: zodResolver(materialDonationSchema),
    defaultValues: {
      donorName: "",
      donorContact: "",
      title: "",
      description: "",
      category: "",
      pickupLocation: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: MaterialDonationForm) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/material-donations", {
        donorName: data.donorName,
        donorContact: data.donorContact,
        title: data.title,
        description: data.description,
        category: data.category,
        pickupLocation: data.pickupLocation,
      });

      toast({
        title: "Don proposé avec succès",
        description: "Notre équipe vous contactera bientôt pour organiser la récupération.",
      });

      // Redirect to home page after successful submission
      setLocation("/");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre proposition.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: "Électronique", label: "Électronique", example: "Ordinateurs, téléphones, tablettes..." },
    { value: "Vêtements", label: "Vêtements", example: "Habits, chaussures, accessoires..." },
    { value: "Mobilier", label: "Mobilier", example: "Tables, chaises, armoires..." },
    { value: "Éducation", label: "Éducation", example: "Livres, fournitures scolaires..." },
    { value: "Jouets", label: "Jouets", example: "Jeux, peluches, jouets éducatifs..." },
    { value: "Autre", label: "Autre", example: "Autres objets en bon état..." },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral mb-4">Proposer un Don Matériel</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Vous avez des objets en bon état à donner ? Proposez-les à notre équipe pour qu'ils soient 
            vérifiés et mis à disposition dans la boutique solidaire.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-xl font-semibold mb-6">Informations sur le don</h2>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="donorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Votre nom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Jean Kouassi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="donorContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact (Email ou Téléphone) *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: jean@email.com ou +225 XX XX XX XX" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Item Information */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre du don *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Ordinateur portable HP" {...field} />
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
                        <FormLabel>Description détaillée *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez l'état, la marque, les spécifications, la quantité, etc."
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
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div>
                                  <div className="font-medium">{category.label}</div>
                                  <div className="text-xs text-gray-500">{category.example}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Photo Upload Placeholder */}
                  <div>
                    <Label>Photos des objets (optionnel)</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <CloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-2">
                        Glissez vos photos ici ou cliquez pour sélectionner
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG jusqu'à 5MB chacune (max 5 photos)
                      </p>
                      <Button type="button" variant="outline" className="mt-2">
                        Sélectionner les photos
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Les photos aident notre équipe à évaluer plus rapidement votre don.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="pickupLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lieu de récupération *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Cocody, près de la pharmacie centrale" 
                            {...field} 
                          />
                        </FormControl>
                        <p className="text-sm text-gray-500 mt-1">
                          Notre équipe vous contactera pour organiser la récupération
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Process Information */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-yellow-800 mb-2">Processus de vérification</h3>
                        <p className="text-sm text-yellow-700">
                          Après réception de votre proposition, notre équipe vous contactera pour 
                          vérifier et récupérer les objets. Une fois validés, ils seront mis en ligne 
                          dans la boutique solidaire.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">
                            J'accepte que mes objets soient vérifiés et redistribués gratuitement 
                            aux bénéficiaires
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/")}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-orange-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Envoi en cours..." : "Proposer le don"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Process Steps */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-6">Comment ça marche</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Search className="text-primary w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">1. Vérification</h4>
                    <p className="text-gray-600 text-sm">
                      Nos équipes examinent et valident votre proposition de don
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="text-secondary w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">2. Récupération</h4>
                    <p className="text-gray-600 text-sm">
                      Nous organisons la collecte à l'adresse que vous indiquez
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Store className="text-accent w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">3. Mise en boutique</h4>
                    <p className="text-gray-600 text-sm">
                      Votre objet rejoint la boutique solidaire pour aider les bénéficiaires
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">Conseils pour votre don</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    Assurez-vous que l'objet fonctionne correctement
                  </p>
                </div>
                
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    Nettoyez l'objet avant la récupération
                  </p>
                </div>
                
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    Incluez tous les accessoires et notices
                  </p>
                </div>
                
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    Soyez précis dans votre description
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-primary rounded-xl p-6 text-white">
              <h3 className="font-semibold text-lg mb-4">Impact de vos dons</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-orange-100">Articles collectés</span>
                  <span className="font-bold text-xl">2,891</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-orange-100">Familles aidées</span>
                  <span className="font-bold text-xl">1,247</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-orange-100">Taux de satisfaction</span>
                  <span className="font-bold text-xl">98%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
