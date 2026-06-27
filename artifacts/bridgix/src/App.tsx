import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import JoinPage from "@/pages/JoinPage";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function trackVisit() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const hasCookie = document.cookie.includes("bridigix_visited");
    if (!hasCookie) {
      const expires = new Date();
      expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000);
      document.cookie = `bridigix_visited=1;expires=${expires.toUTCString()};path=/;SameSite=Lax`;
      document.cookie = `bridigix_tz=${encodeURIComponent(tz)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }
  } catch { /* ignore */ }
}

trackVisit();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/join" component={JoinPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
