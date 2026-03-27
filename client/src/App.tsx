import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import NoiseOverlay from "@/components/NoiseOverlay";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";
import OnboardingModal from "@/components/OnboardingModal";
import LoadingScreen from "@/components/garden/LoadingScreen";
import { useAuth } from "@/hooks/use-auth";
const Home = lazy(() => import("@/pages/Home"));
const Garden = lazy(() => import("@/pages/Garden"));
const Collections = lazy(() => import("@/pages/Collections"));
const PublicCollection = lazy(() => import("@/pages/PublicCollection"));
const WriterProfile = lazy(() => import("@/pages/WriterProfile"));
const PublicGarden = lazy(() => import("@/pages/PublicGarden"));
const EditorStudio = lazy(() => import("@/pages/EditorStudio"));
const InBloom = lazy(() => import("@/pages/Gallery"));
const Piece = lazy(() => import("@/pages/Piece"));
const About = lazy(() => import("@/pages/About"));
const Courses = lazy(() => import("@/pages/Courses"));
const Drafts = lazy(() => import("@/pages/Drafts"));
const EICDashboard = lazy(() => import("@/pages/EICDashboard"));
const EditorOnboarding = lazy(() => import("@/pages/EditorOnboarding"));
const ExerciseAdmin = lazy(() => import("@/pages/ExerciseAdmin"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Accessibility = lazy(() => import("@/pages/Accessibility"));
const Commons = lazy(() => import("@/pages/Commons"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const GardenInfo = lazy(() => import("@/pages/GardenInfo"));
const FieldGuide = lazy(() => import("@/pages/FieldGuide"));
const EditProfile = lazy(() => import("@/pages/EditProfile"));
const GardenGuide = lazy(() => import("@/pages/GardenGuide"));
const ContactEditors = lazy(() => import("@/pages/ContactEditors"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Opportunities = lazy(() => import("@/pages/Opportunities"));
const Submissions = lazy(() => import("@/pages/Submissions"));
const ForJournals = lazy(() => import("@/pages/ForJournals"));
const Saved = lazy(() => import("@/pages/Saved"));
// V2 Redesign pages
const V2Dashboard = lazy(() => import("@/pages/V2Dashboard"));
const V2ReadingRoom = lazy(() => import("@/pages/V2ReadingRoom"));
const V2Community = lazy(() => import("@/pages/V2Community"));
const EditorialServices = lazy(() => import("@/pages/EditorialServices"));
const EditorialDashboard = lazy(() => import("@/pages/EditorialDashboard"));
const EditorialPayment = lazy(() => import("@/pages/EditorialPayment"));
const EditorialRoom = lazy(() => import("@/pages/EditorialRoom")); const Marketplace = lazy(() => import("@/pages/Marketplace")); const Marketplace = lazy(() => import("@/pages/Marketplace"));

// T35: ProtectedRoute uses branded LoadingScreen instead of generic PageLoader
// T48: destructure path out so it is never spread into the Component
function ProtectedRoute({ component: Component, path }: { component: React.ComponentType<any>; path: string }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <LoadingScreen />;
  }
  if (!user) {
    return <Redirect to="/sign-in" />;
  }
  return <Component />;
}
const PAGE_TITLES: Record<string, string> = {
  "/": "The Page Gallery Journal \u2014 A Literary Journal & Writing Garden",
  "/in-bloom": "The Journal \u2014 The Page Gallery",
  "/publications": "Archive & Contributors \u2014 The Page Gallery",
  "/gallery": "The Journal \u2014 The Page Gallery",
  "/journal": "The Journal \u2014 The Page Gallery",
  "/about": "About \u2014 The Page Gallery Journal",
  "/garden": "My Garden \u2014 The Page Gallery",
  "/commons": "The Commons \u2014 The Page Gallery",
  "/how-it-works": "How It Works \u2014 The Page Gallery",
  "/garden-info": "Garden Seasons \u2014 The Page Gallery",
  "/privacy": "Privacy Policy \u2014 The Page Gallery",
  "/terms": "Terms of Service \u2014 The Page Gallery",
  "/accessibility": "Accessibility \u2014 The Page Gallery",
  "/sign-in": "Sign In \u2014 The Page Gallery",
  "/for-journals": "For Journals \u2014 The Page Gallery",
  "/saved": "Saved Pieces \u2014 The Page Gallery",
};
function PageTitle() {
  const [location] = useLocation();
  useEffect(() => {
    if (location.startsWith("/piece/")) {
      return;
    }
    const title = PAGE_TITLES[location] || "The Page Gallery Journal";
    document.title = title;
  }, [location]);
  return null;
}
function Router() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Switch>
        <Route path="/sign-in" component={SignIn} />
        <Route path="/garden" component={Garden} />
            <Route path="/drafts">{() => <ProtectedRoute component={Drafts} path="/drafts" />}</Route>
        <Route path="/grove">{() => <Redirect to="/garden" />}</Route>
        <Route path="/garden/collections" component={Collections} /> <Route path="/garden/collections/:id" component={Collections} /> <Route path="/collections/:slug" component={PublicCollection} /> <Route path="/garden/:username" component={PublicGarden} />
        <Route path="/edit-profile" component={EditProfile} />
        <Route path="/writer/:id" component={WriterProfile} />
        <Route path="/public-garden/:userId" component={PublicGarden} />
        <Route path="/piece/:id" component={Piece} />
        <Route path="/in-bloom" component={InBloom} />
        <Route path="/gallery" component={InBloom} />
        <Route path="/saved" component={Saved} />
        <Route path="/editor-studio">{() => <ProtectedRoute component={EditorStudio} path="/editor-studio" />}</Route>
        <Route path="/about" component={About} />
        <Route path="/courses" component={Courses} />
        <Route path="/eic-dashboard">{() => <ProtectedRoute component={EICDashboard} path="/eic-dashboard" />}</Route>
        <Route path="/editor-onboarding">{() => <ProtectedRoute component={EditorOnboarding} path="/editor-onboarding" />}</Route>
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/commons" component={Commons} />
        <Route path="/how-it-works" component={HowItWorks} />
        <Route path="/garden-info" component={GardenInfo} />
        <Route path="/field-guide" component={FieldGuide} />
        <Route path="/accessibility" component={Accessibility} />
        <Route path="/garden-guide" component={GardenGuide} />
        <Route path="/publications" component={InBloom} />
        <Route path="/contact-editors" component={ContactEditors} />
        <Route path="/v2" component={V2Dashboard} />
        <Route path="/v2/reading-room" component={V2ReadingRoom} />
        <Route path="/v2/community" component={V2Community} />
        <Route path="/editorial-services" component={EditorialServices} />
        <Route path="/dashboard/editorial">{() => <ProtectedRoute component={EditorialDashboard} path="/dashboard/editorial" />}</Route>
        <Route path="/editorial-payment" component={EditorialPayment} />
        <Route path="/settings">{() => <Redirect to="/edit-profile" />}</Route>
        <Route path="/seasons">{() => <Redirect to="/courses" />}</Route>
        <Route path="/journal">{() => <Redirect to="/in-bloom" />}</Route>
        <Route path="/read">{() => <Redirect to="/in-bloom" />}</Route>
        <Route path="/editorial-room">{() => <ProtectedRoute component={EditorialRoom} path="/editorial-room" />}</Route>
        <Route path="/submit">{() => <Redirect to="/in-bloom" />}</Route>
        <Route path="/opportunities" component={Opportunities} />
        <Route path="/submissions" component={Submissions} />
        <Route path="/for-journals" component={ForJournals} />
        <Route path="/exercise-admin">{() => <ProtectedRoute component={ExerciseAdmin} path="/exercise-admin" />}</Route>
        <Route path="/marketplace" component={Marketplace} />               <Route path="/marketplace" component={Marketplace} />               <Route path="/marketplace" component={Marketplace} />               <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SmoothScroll>
          <NoiseOverlay />
          <AccessibilityToolbar />
          <OnboardingModal />
          <PageTitle />
          <Router />
          <Toaster />
        </SmoothScroll>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
export default App;
