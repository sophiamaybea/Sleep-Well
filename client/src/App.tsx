import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Garden from "@/pages/Garden";
import WriterProfile from "@/pages/WriterProfile";
import PublicGarden from "@/pages/PublicGarden";
import EditorStudio from "@/pages/EditorStudio";
import Gallery from "@/pages/Gallery";
import About from "@/pages/About";
import Courses from "@/pages/Courses";
import Challenges from "@/pages/Challenges";
import EICDashboard from "@/pages/EICDashboard";
import EditorOnboarding from "@/pages/EditorOnboarding";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import NoiseOverlay from "@/components/NoiseOverlay";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/garden" component={Garden} />
      <Route path="/writer/:id" component={WriterProfile} />
      <Route path="/public-garden/:userId" component={PublicGarden} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/editor-studio" component={EditorStudio} />
      <Route path="/about" component={About} />
      <Route path="/courses" component={Courses} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/eic-dashboard" component={EICDashboard} />
      <Route path="/editor-onboarding" component={EditorOnboarding} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SmoothScroll>
          <NoiseOverlay />
          <CustomCursor />
          <Toaster />
          <Router />
        </SmoothScroll>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
