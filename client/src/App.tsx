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
import StarBackground from "@/components/StarBackground";
const Home = lazy(() => import("@/pages/Home"));
const Garden = lazy(() => import("@/pages/Garden"));
const WriterProfile = lazy(() => import("@/pages/WriterProfile"));
const PublicGarden = lazy(() => import("@/pages/PublicGarden"));
const EditorStudio = lazy(() => import("@/pages/EditorStudio"));
const InBloom = lazy(() => import("@/pages/Gallery"));
const Piece = lazy(() => import("@/pages/Piece"));
const About = lazy(() => import("@/pages/About"));
const Courses = lazy(() => import("@/pages/Courses"));
const EICDashboard = lazy(() => import("@/pages/EICDashboard"));
const EditorOnboarding = lazy(() => import("@/pages/EditorOnboarding"));
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
// V2 Redesign pages
const V2Dashboard = lazy(() => import("@/pages/V2Dashboard"));
const V2ReadingRoom = lazy(() => import("@/pages/V2ReadingRoom"));
const V2Community = lazy(() => import("@/pages/V2Community"));
const EditorialServices = lazy(() => import("@/pages/EditorialServices"));
const EditorialDashboard = lazy(() => import("@/pages/EditorialDashboard"));
const EditorialPayment = lazy(() => import("@/pages/EditorialPayment"));
const PAGE_TITLES: Record<string, string> = {
 "/": "The Page Gallery Journal — A Literary Journal & Writing Garden",
 "/in-bloom": "The Journal — The Page Gallery",
 "/publications": "Archive & Contributors — The Page Gallery",
 "/gallery": "The Journal — The Page Gallery",
 "/journal": "The Journal — The Page Gallery",
 "/about": "About — The Page Gallery Journal",
 "/garden": "My Garden — The Page Gallery",
 "/commons": "The Commons — The Page Gallery",
 "/how-it-works": "How It Works — The Page Gallery",
 "/garden-info": "Garden Seasons — The Page Gallery",
 "/privacy": "Privacy Policy — The Page Gallery",
 "/terms": "Terms of Service — The Page Gallery",
 "/accessibility": "Accessibility — The Page Gallery",
 "/sign-in": "Sign In — The Page Gallery",
};
function PageTitle() {
 const [location] = useLocation();
 useEffect(() => {
 // Dynamic title for piece pages
 if (location.startsWith("/piece/")) {
 // Title will be set by the Piece page component itself
 return;
 }
 const title = PAGE_TITLES[location] || "The Page Gallery Journal";
 document.title = title;
 }, [location]);
 return null;
}
function PageLoader() {
 return (
 <div
 className="min-h-screen flex items-center justify-center"
 style={{ backgroundColor: "#060d06" }}
 >
 <div className="flex flex-col items-center gap-4">
 <div className="relative w-10 h-10">
 <div className="absolute inset-0 rounded-full border border-amber-500/20 border-t-amber-500/50 animate-spin" />
 </div>
 <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/30">
 Loading...
 </p>
 </div>
 </div>
 );
}
function Router() {
 return (
 <Suspense fallback={<PageLoader />}>
 <Switch>
 <Route path="/sign-in" component={SignIn} />
 <Route path="/garden" component={Garden} />
 <Route path="/grove">{() => <Redirect to="/garden" />}</Route>
 <Route path="/garden/:username" component={PublicGarden} />
 <Route path="/edit-profile" component={EditProfile} />
 <Route path="/writer/:id" component={WriterProfile} />
 <Route path="/public-garden/:userId" component={PublicGarden} />
 <Route path="/piece/:id" component={Piece} />
 <Route path="/in-bloom" component={InBloom} />
 <Route path="/gallery" component={InBloom} />
 <Route path="/editor-studio" component={EditorStudio} />
 <Route path="/about" component={About} />
 <Route path="/courses" component={Courses} />
 <Route path="/eic-dashboard" component={EICDashboard} />
 <Route path="/editor-onboarding" component={EditorOnboarding} />
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
 <Route path="/dashboard/editorial" component={EditorialDashboard} />
 <Route path="/editorial-payment" component={EditorialPayment} />
 <Route path="/settings">{() => <Redirect to="/edit-profile" />}</Route>
 <Route path="/seasons">{() => <Redirect to="/courses" />}</Route>
 <Route path="/journal">{() => <Redirect to="/in-bloom" />}</Route>
 <Route path="/read">{() => <Redirect to="/in-bloom" />}</Route>
 <Route path="/submit">{() => <Redirect to="/in-bloom" />}</Route>
 <Route path="/opportunities" component={Opportunities} />
 <Route path="/" component={Home} />
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
 <StarBackground />
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
