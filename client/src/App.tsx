import { Route, Switch, Redirect } from 'wouter';
import { useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ChurchRegister from './pages/ChurchRegister';
import PendingApproval from './pages/PendingApproval';
import ChurchDashboard from './pages/ChurchDashboard';
import MembersPage from './pages/MembersPage';
import ChurchProfilePage from './pages/ChurchProfilePage';
import PublicChurchProfile from './pages/PublicChurchProfile';
import FindChurch from './pages/FindChurch';

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={ChurchRegister} />
      <Route path="/pending" component={PendingApproval} />
      <Route path="/find-church" component={FindChurch} />
      <Route path="/church/:slug" component={PublicChurchProfile} />

      <Route path="/dashboard">
        <ProtectedRoute>
          <ChurchDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/members">
        <ProtectedRoute>
          <MembersPage />
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/profile">
        <ProtectedRoute>
          <ChurchProfilePage />
        </ProtectedRoute>
      </Route>

      <Route>
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
          <h1 className="text-4xl font-bold text-navy">404</h1>
          <p className="text-muted-foreground">Page not found.</p>
          <a href="/" className="text-navy underline">
            Return home
          </a>
        </div>
      </Route>
    </Switch>
  );
}
