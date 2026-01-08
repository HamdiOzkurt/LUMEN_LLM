import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import EnterpriseDashboard from "./pages/EnterpriseDashboard";

// New Pages
import Logs from "./pages/Logs";
import Models from "./pages/Models";
import Projects from "./pages/Projects";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Team from "./pages/Team";
import ApiKeys from "./pages/ApiKeys";
import Docs from "./pages/Docs";

function Router() {
  const [location, setLocation] = useLocation();

  // Redirect root to Enterprise Dashboard
  if (location === "/") {
    setLocation("/enterprise-dashboard");
  }

  return (
    <Switch>
      <Route path={"/enterprise-dashboard"} component={EnterpriseDashboard} />

      {/* New Enterprise Routes */}
      <Route path={"/logs"} component={Logs} />
      <Route path={"/models"} component={Models} />
      <Route path={"/projects"} component={Projects} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/team"} component={Team} />
      <Route path={"/keys"} component={ApiKeys} />
      <Route path={"/docs"} component={Docs} />

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
