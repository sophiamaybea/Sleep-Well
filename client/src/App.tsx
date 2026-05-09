import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { lazy, Suspense, useEffect, type ComponentType } from "react";
import { Redirect, Route, Switch, useLocation } from "wouter";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingScreen from "@/components/garden/LoadingScreen";
import NoiseOverlay from "@/components/NoiseOverlay";
import OnboardingModal from "@/components/OnboardingModal";
import SmoothScroll from "@/components/SmoothScroll";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";

const About = lazy(() => import("@/pages/About"));
const Accessibility = lazy(() => import("@/pages/Accessibility"));
const Atelier = lazy(() => import("@/pages/Atelier"));
const Challenges = lazy(() => import("@/pages/Challenges"));
const Collections = lazy(() => import("@/pages/Collections"));
const Commons = lazy(() => import("@/pages/Commons"));
const Community = lazy(() => import("@/pages/Community"));
const ContactEditors = lazy(() => import("@/pages/ContactEditors"));
const Courses = lazy(() => import("@/pages/Courses"));
const Cultivator = lazy(() => import("@/pages/Cultivator"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Drafts = lazy(() => import("@/pages/Drafts"));
const EditProfile = lazy(() => import("@/pages/EditProfile"));
const EditorOnboarding = lazy(() => import("@/pages/EditorOnboarding"));
const EditorStudio = lazy(() => import("@/pages/EditorStudio"));
const EditorialDashboard = lazy(() => import("@/pages/EditorialDashboard"));
const EditorialPayment = lazy(() => import("@/pages/EditorialPayment"));
const EditorialRoom = lazy(() => import("@/pages/EditorialRoom"));
const ExerciseAdmin = lazy(() => import("@/pages/ExerciseAdmin"));
const Exhibit = lazy(() => import("@/pages/Exhibit"));
const Exhibits = lazy(() => import("@/pages/Exhibits"));
const FieldGuide = lazy(() => import("@/pages/FieldGuide"));
const ForJournals = lazy(() => import("@/pages/ForJournals"));
const FoundingEditions = lazy(() => import("@/pages/FoundingEditions"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Garden = lazy(() => import("@/pages/Garden"));
const GardenGuide = lazy(() => import("@/pages/GardenGuide"));
const GardenInfo = lazy(() => import("@/pages/GardenInfo"));
const Grove = lazy(() => import("@/pages/Grove"));
const Home = lazy(() => import("@/pages/Home"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Opportunities = lazy(() => import("@/pages/Opportunities"));
const PageGallery = lazy(() => import("@/pages/PageGallery"));
const Piece = lazy(() => import("@/pages/Piece"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const PublicCollection = lazy(() => import("@/pages/PublicCollection"));
const PublicGarden = lazy(() => import("@/pages/PublicGarden"));
const Publications = lazy(() => import("@/pages/Publications"));
const ReadingRoom = lazy(() => import("@/pages/ReadingRoom"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Saved = lazy(() => import("@/pages/Saved"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const Submissions = lazy(() => import("@/pages/Submissions"));
const Terms = lazy(() => import("@/pages/Terms"));
const Weave = lazy(() => import("@/pages/Weave"));
const WorkshopRoom = lazy(() => import("@/pages/WorkshopRoom"));
const WriterProfile = lazy(() => import("@/pages/WriterProfile"));

type GuardedRouteProps = {
  component: ComponentType;
};

type SimpleRoute = {
  component: ComponentType;
  path: string;
};

const publicRoutes: SimpleRoute[] = [
  { path: "/", component: Home },
  { path: "/collection/:id", component: PublicCollection },
  { path: "/writer/:username", component: WriterProfile },
  { path: "/garden/:username", component: PublicGarden },
  { path: "/in-bloom", component: Gallery },
  { path: "/gallery", component: PageGallery },
  { path: "/journal", component: PageGallery },
  { path: "/piece/:id", component: Piece },
  { path: "/weave/:id", component: Weave },
  { path: "/about", component: About },
  { path: "/publications", component: Publications },
  { path: "/courses", component: Courses },
  { path: "/sign-in", component: SignIn },
  { path: "/reset-password", component: ResetPassword },
  { path: "/privacy", component: Privacy },
  { path: "/terms", component: Terms },
  { path: "/accessibility", component: Accessibility },
  { path: "/commons", component: Commons },
  { path: "/how-it-works", component: HowItWorks },
  { path: "/garden-info", component: GardenInfo },
  { path: "/field-guide", component: FieldGuide },
  { path: "/garden-guide", component: GardenGuide },
  { path: "/contact-editors", component: ContactEditors },
  { path: "/opportunities", component: Opportunities },
  { path: "/submissions", component: Submissions },
  { path: "/for-journals", component: ForJournals },
  { path: "/community", component: Community },
  { path: "/marketplace", component: Marketplace },
  { path: "/challenges", component: Challenges },
  { path: "/exhibits", component: Exhibits },
  { path: "/exhibits/:slug", component: Exhibit },
  { path: "/cultivator", component: Cultivator },
  { path: "/atelier", component: Atelier },
  { path: "/editions/founding", component: FoundingEditions },
];

const protectedRoutes: SimpleRoute[] = [
  { path: "/garden", component: Garden },
  { path: "/collections", component: Collections },
  { path: "/drafts", component: Drafts },
  { path: "/edit-profile", component: EditProfile },
  { path: "/saved", component: Saved },
  { path: "/dashboard", component: Dashboard },
  { path: "/reading-room", component: ReadingRoom },
  { path: "/editorial-payment", component: EditorialPayment },
  { path: "/workshop-room", component: WorkshopRoom },
  { path: "/grove", component: Grove },
];

const editorRoutes: SimpleRoute[] = [
  { path: "/editor-studio", component: EditorStudio },
  { path: "/editor-onboarding", component: EditorOnboarding },
  { path: "/exercise-admin", component: ExerciseAdmin },
  { path: "/editorial-dashboard", component: EditorialDashboard },
  { path: "/editorial-room", component: EditorialRoom },
];

const PAGE_TITLES: Record<string, string> = {
  "/": "The Page Gallery Journal — A Literary Journal & Writing Garden",
  "/about": "About — The Page Gallery Journal",
  "/accessibility": "Accessibility — The Page Gallery",
  "/commons": "The Commons — The Page Gallery",
  "/for-journals": "For Journals — The Page Gallery",
  "/gallery": "The Journal — The Page Gallery",
  "/garden": "My Garden — The Page Gallery",
  "/garden-info": "Garden Seasons — The Page Gallery",
  "/how-it-works": "How It Works — The Page Gallery",
  "/in-bloom": "The Journal — The Page Gallery",
  "/journal": "The Journal — The Page Gallery",
  "/publications": "Archive & Contributors — The Page Gallery",
  "/privacy": "Privacy Policy — The Page Gallery",
  "/saved": "Saved Pieces — The Page Gallery",
  "/sign-in": "Sign In — The Page Gallery",
  "/terms": "Terms of Service — The Page Gallery",
  "/exhibits": "Exhibits — The Page Gallery",
};

function ProtectedRoute({ component: Component }: GuardedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect to="/sign-in" />;
  }

  return <Component />;
}

function EditorProtectedRoute({ component: Component }: GuardedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect to="/sign-in" />;
  }

  if (user.role !== "editor" && user.role !== "editor_in_chief") {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function PageTitle() {
  const [location] = useLocation();

  useEffect(() => {
    if (location.startsWith("/piece/")) {
      return;
    }

    document.title = PAGE_TITLES[location] || "The Page Gallery Journal";
  }, [location]);

  return null;
}

function AppRoutes() {
  return (
    <main id="main-content">
      <Suspense fallback={<LoadingScreen />}>
        <Switch>
          {publicRoutes.map(({ path, component }) => (
            <Route key={path} path={path} component={component} />
          ))}

          {protectedRoutes.map(({ path, component }) => (
            <Route key={path} path={path}>
              {() => <ProtectedRoute component={component} />}
            </Route>
          ))}

          {editorRoutes.map(({ path, component }) => (
            <Route key={path} path={path}>
              {() => <EditorProtectedRoute component={component} />}
            </Route>
          ))}

          <Route path="/public-garden/:userId">
            {(params) => <Redirect to={`/garden/${params.userId}`} />}
          </Route>
          <Route path="/eic-dashboard">
            {() => <Redirect to="/editorial-dashboard" />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </main>
  );
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SmoothScroll>
            <NoiseOverlay />
            <AccessibilityToolbar />
            <OnboardingModal />
            <PageTitle />
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
            <Toaster />
          </SmoothScroll>
        </TooltipProvider>
      </QueryClientProvider>
    </MotionConfig>
  );
}

export default App;
