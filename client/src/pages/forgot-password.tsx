import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Heart, Mail, ArrowLeft, CheckCircle } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const { forgotPassword, isLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      await forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de l'email",
        variant: "destructive",
      });
    }
  };

  const handleResendEmail = async () => {
    try {
      await forgotPassword(submittedEmail);
      toast({
        title: "Email renvoyé",
        description: "Un nouveau lien de réinitialisation a été envoyé.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de renvoyer l'email.",
        variant: "destructive",
      });
    }
  };

  if (isSubmitted) {
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
          </div>

          {/* Success Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle>Email envoyé !</CardTitle>
              <CardDescription>
                Un lien de réinitialisation a été envoyé à {submittedEmail}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Étapes suivantes :</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>1. Vérifiez votre boîte de réception</li>
                  <li>2. Cliquez sur le lien dans l'email</li>
                  <li>3. Créez votre nouveau mot de passe</li>
                  <li>4. Connectez-vous avec vos nouveaux identifiants</li>
                </ul>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">Vous n'avez pas reçu l'email ?</p>
                <ul className="space-y-1">
                  <li>• Vérifiez votre dossier spam</li>
                  <li>• Le lien expire dans 1 heure</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  Renvoyer l'email
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href="/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
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
          <h2 className="text-3xl font-bold text-neutral">Mot de passe oublié</h2>
          <p className="mt-2 text-gray-600">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Forgot Password Form */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center flex items-center justify-center">
              <Mail className="w-6 h-6 mr-2" />
              Réinitialiser le mot de passe
            </CardTitle>
            <CardDescription className="text-center">
              Nous vous enverrons un lien sécurisé pour créer un nouveau mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="votre@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-orange-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-gray-600 hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Help */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Besoin d'aide ?{" "}
            <a href="#" className="text-primary hover:underline">
              Contactez notre support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
