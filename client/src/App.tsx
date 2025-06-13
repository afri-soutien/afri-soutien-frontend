import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Home from "@/pages/home";
import Campaigns from "@/pages/campaigns";
import CampaignDetail from "@/pages/campaign-detail";
import Boutique from "@/pages/boutique";
import MaterialDonation from "@/pages/material-donation";
import Login from "@/pages/login";
import Register from "@/pages/register";
import VerifyEmail from "@/pages/verify-email";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import BoutiqueItemDetail from "@/pages/boutique-item-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/campaigns/:id" component={CampaignDetail} />
      <Route path="/boutique" component={Boutique} />
      <Route path="/boutique/:id" component={BoutiqueItemDetail} />
      <Route path="/donate-material" component={MaterialDonation} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/profile" component={Dashboard} />
      <Route path="/dashboard/create-campaign" component={Dashboard} />
      <Route path="/dashboard/my-campaigns" component={Dashboard} />
      <Route path="/dashboard/my-orders" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/campaigns" component={Admin} />
      <Route path="/admin/material-donations" component={Admin} />
      <Route path="/admin/boutique-orders" component={Admin} />
      <Route path="/admin/users" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
