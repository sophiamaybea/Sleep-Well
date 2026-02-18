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
import SignIn from "@/pages/SignIn";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Exhibit from "@/pages/Exhibit";
import Exhibits from "@/pages/Exhibits";
import Opportunities from "@/pages/Opportunities";
import Commons from "@/pages/Commons";
import HowItWorks from "@/pages/HowItWorks";
import FieldGuide from "@/pages/FieldGuide";
import Nursery from "@/pages/Nursery";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import NoiseOverlay from "@/components/NoiseOverlay";

function Router() {
  return (
    <Switch>
      <Route path="/sign-in" component={SignIn} />
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
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/exhibits" component={Exhibits} />
      <Route path="/exhibits/:slug" component={Exhibit} />
      <Route path="/opportunities" component={Opportunities} />
      <Route path="/commons" component={Commons} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/field-guide" component={FieldGuide} />
      <Route path="/nursery" component={Nursery} />
      <Route path="/" component={Home} />
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
