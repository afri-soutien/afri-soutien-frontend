import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Users } from "lucide-react";
import { Link } from "wouter";

interface CampaignCardProps {
  campaign: {
    id: number;
    title: string;
    description: string;
    goalAmount: string;
    currentAmount: string;
    status: string;
    category?: string;
    createdAt: string;
  };
  showDonateButton?: boolean;
  onDonate?: (campaignId: number) => void;
}

export default function CampaignCard({ campaign, showDonateButton = true, onDonate }: CampaignCardProps) {
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

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'medical':
        return 'bg-red-100 text-red-800';
      case 'education':
        return 'bg-blue-100 text-blue-800';
      case 'business':
        return 'bg-green-100 text-green-800';
      case 'emergency':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Badge className="bg-trust text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Vérifié
          </Badge>
          {campaign.category && (
            <Badge className={getCategoryColor(campaign.category)}>
              {campaign.category}
            </Badge>
          )}
        </div>

        <Link href={`/campaigns/${campaign.id}`}>
          <h3 className="font-semibold text-lg text-neutral mb-2 hover:text-primary cursor-pointer">
            {campaign.title}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {campaign.description}
        </p>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Collecté</span>
            <span>{formatAmount(current)} / {formatAmount(goal)}</span>
          </div>
          
          <Progress value={progressPercentage} className="h-2 mb-1" />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>{progressPercentage.toFixed(0)}% atteint</span>
            <span className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              Donateurs
            </span>
          </div>
        </div>

        {showDonateButton && (
          <Button
            className="w-full bg-primary hover:bg-orange-700"
            onClick={() => onDonate?.(campaign.id)}
          >
            Contribuer maintenant
          </Button>
        )}
      </div>
    </div>
  );
}
