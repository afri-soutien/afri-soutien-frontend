import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Heart, Eye, EyeOff, CheckCircle, AlertCircle, Lock } from "lucide-react";

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const { resetPassword, isLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");

  const passwordRequirements = [
    { label: "Au moins 8 caractères", test: (pwd: string) => pwd.length >= 8 },
    { label: "Une majuscule", test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: "Une minuscule", test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: "Un chiffre", test: (pwd: string) => /[0-9]/.test(pwd) },
  ];

  useEffect(() => {
    // Extract token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get("token");
    
    if (resetToken) {
      setToken(resetToken);
      setIsValidToken(true); // In a real app, you'd validate the token with the server
    } else {
      setIsValidToken(false);
    }
  }, []);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast({
        title: "Erreur",
        description: "Token de réinitialisation manquant",
        variant: "destructive",
      });
      return;
    }

    try {
      await resetPassword(token, data.password);
      toast({
        title: "Mot de passe réinitialisé",
        description: "Votre mot de passe a été modifié avec succès !",
      });
      setLocation("/login");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de réinitialiser le mot de passe",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification du lien...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Heart className="text-white w-5 h-5" />
              </div>
              <span className="font-header font-bold text-2xl text-neutral">Afri Soutien</span>
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle>Lien invalide</CardTitle>
              <CardDescription>
                Le lien de réinitialisation est invalide ou a expiré
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-gray-600">
                <p>Le lien de réinitialisation :</p>
                <ul className="mt-2 space-y-1">
                  <li>• Peut avoir expiré (valide 1 heure)</li>
                  <li>• Peut avoir déjà été utilisé</li>
                  <li>• Peut être mal formé</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  asChild
                  className="w-full bg-primary hover:bg-orange-700"
                >
                  <Link href="/forgot-password">
                    Demander un nouveau lien
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href="/login">
                    Retour à la connexion
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Heart className="text-white w-5 h-5" />
            </div>
            <span className="font-header font-bold text-2xl text-neutral">Afri Soutien</span>
          </Link>
          <h2 className="text-3xl font-bold text-neutral">Nouveau mot de passe</h2>
          <p className="mt-2 text-gray-600">
            Créez un mot de passe sécurisé pour votre compte
          </p>
        </div>

        {/* Reset Password Form */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center flex items-center justify-center">
              <Lock className="w-6 h-6 mr-2" />
              Réinitialiser le mot de passe
            </CardTitle>
            <CardDescription className="text-center">
              Votre nouveau mot de passe doit être différent de l'ancien
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nouveau mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      
                      {/* Password Requirements */}
                      {password && (
                        <div className="mt-2 space-y-1">
                          {passwordRequirements.map((req, index) => (
                            <div
                              key={index}
                              className={`flex items-center space-x-2 text-xs ${
                                req.test(password) ? "text-green-600" : "text-gray-500"
                              }`}
                            >
                              <CheckCircle
                                className={`w-3 h-3 ${
                                  req.test(password) ? "text-green-600" : "text-gray-300"
                                }`}
                              />
                              <span>{req.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Conseils de sécurité :</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Utilisez un mot de passe unique</li>
                    <li>• Mélangez lettres, chiffres et symboles</li>
                    <li>• Évitez les informations personnelles</li>
                    <li>• Stockez-le dans un gestionnaire de mots de passe</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-orange-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-primary"
              >
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
