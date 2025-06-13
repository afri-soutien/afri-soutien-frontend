import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Heart, Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "error">("pending");
  const [isResending, setIsResending] = useState(false);
  const { verifyEmail } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check for verification token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      handleEmailVerification(token);
    }
  }, []);

  const handleEmailVerification = async (token: string) => {
    try {
      await verifyEmail(token);
      setVerificationStatus("success");
      toast({
        title: "Email vérifié avec succès",
        description: "Votre compte est maintenant activé !",
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        setLocation("/login");
      }, 3000);
    } catch (error) {
      setVerificationStatus("error");
      toast({
        title: "Erreur de vérification",
        description: "Le lien de vérification est invalide ou expiré.",
        variant: "destructive",
      });
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      // In a real implementation, you'd call an API to resend verification email
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Email renvoyé",
        description: "Un nouveau lien de vérification a été envoyé à votre adresse email.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de renvoyer l'email de vérification.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case "success":
        return (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral mb-2">Email vérifié !</h2>
              <p className="text-gray-600">
                Votre compte a été activé avec succès. Vous allez être redirigé vers la page de connexion.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => setLocation("/login")}
                className="w-full bg-primary hover:bg-orange-700"
              >
                Se connecter maintenant
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                className="w-full"
              >
                Retour à l'accueil
              </Button>
            </div>
          </>
        );

      case "error":
        return (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral mb-2">Lien invalide</h2>
              <p className="text-gray-600">
                Le lien de vérification est invalide ou a expiré. Veuillez demander un nouveau lien.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full bg-primary hover:bg-orange-700"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Renvoyer l'email de vérification"
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setLocation("/register")}
                className="w-full"
              >
                Retour à l'inscription
              </Button>
            </div>
          </>
        );

      default:
        return (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral mb-2">Vérifiez votre email</h2>
              <p className="text-gray-600">
                Nous avons envoyé un lien de vérification à votre adresse email. 
                Cliquez sur le lien pour activer votre compte.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Vérifiez vos dossiers</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Regardez dans votre boîte de réception</li>
                <li>• Vérifiez le dossier spam/courrier indésirable</li>
                <li>• Le lien expire dans 24 heures</li>
              </ul>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Renvoyer l'email"
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setLocation("/login")}
                className="w-full"
              >
                Retour à la connexion
              </Button>
            </div>
          </>
        );
    }
  };

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

        {/* Verification Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Vérification de l'email</CardTitle>
            <CardDescription>
              Dernière étape pour activer votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
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
