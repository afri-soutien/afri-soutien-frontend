import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: number;
    title: string;
    goalAmount: string;
    currentAmount: string;
  } | null;
  onSubmit: (donation: {
    campaignId: number;
    amount: number;
    donorName?: string;
    paymentOperator: string;
  }) => Promise<void>;
}

export default function DonationModal({ isOpen, onClose, campaign, onSubmit }: DonationModalProps) {
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [paymentOperator, setPaymentOperator] = useState("wave");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!campaign) return null;

  const goal = parseFloat(campaign.goalAmount);
  const current = parseFloat(campaign.currentAmount);
  const progressPercentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const quickAmounts = [5000, 10000, 25000, 50000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const donationAmount = parseFloat(amount);
    if (!donationAmount || donationAmount < 1000) {
      toast({
        title: "Erreur",
        description: "Le montant minimum est de 1,000 FCFA",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        campaignId: campaign.id,
        amount: donationAmount,
        donorName: donorName.trim() || undefined,
        paymentOperator,
      });
      
      toast({
        title: "Don initié",
        description: "Vous allez recevoir une notification pour confirmer le paiement.",
      });
      
      onClose();
      setAmount("");
      setDonorName("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'initiation du don.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Faire un don</DialogTitle>
          <DialogDescription>
            Soutenez cette cause avec votre générosité
          </DialogDescription>
        </DialogHeader>

        <div className="mb-6">
          <div className="bg-primary/10 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-primary mb-1">{campaign.title}</h4>
            <p className="text-sm text-gray-600">Objectif: {formatAmount(goal)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progression</span>
              <span>{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-secondary">{formatAmount(current)}</span>
              <span className="text-gray-600">sur {formatAmount(goal)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Montant du don (FCFA)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 mb-3">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    className="text-sm"
                    onClick={() => setAmount(quickAmount.toString())}
                  >
                    {formatAmount(quickAmount)}
                  </Button>
                ))}
              </div>
              <Input
                id="amount"
                type="number"
                placeholder="Montant personnalisé"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1000"
                required
              />
            </div>

            <div>
              <Label htmlFor="donorName">Nom (optionnel)</Label>
              <Input
                id="donorName"
                type="text"
                placeholder="Votre nom pour l'affichage"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Laissez vide pour un don anonyme
              </p>
            </div>

            <div>
              <Label>Méthode de paiement</Label>
              <RadioGroup value={paymentOperator} onValueChange={setPaymentOperator} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="wave" id="wave" />
                  <Label htmlFor="wave" className="flex items-center cursor-pointer">
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold mr-2">
                      WAVE
                    </div>
                    <span className="text-sm">Wave Money</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="orange" id="orange" />
                  <Label htmlFor="orange" className="flex items-center cursor-pointer">
                    <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold mr-2">
                      OM
                    </div>
                    <span className="text-sm">Orange Money</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mtn" id="mtn" />
                  <Label htmlFor="mtn" className="flex items-center cursor-pointer">
                    <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold mr-2">
                      MTN
                    </div>
                    <span className="text-sm">MTN Money</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Lock className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800 mb-1">Processus de paiement</h3>
                <p className="text-sm text-blue-700">
                  Vous recevrez un SMS/notification de votre opérateur pour confirmer la transaction.
                  Le don sera comptabilisé après confirmation.
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-orange-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Traitement..." : "Confirmer le don"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
