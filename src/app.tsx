import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import DashboardPage from "@/pages/DashboardPage/DashboardPage";
import MembersPage from "@/pages/MembersPage/MembersPage";
import FeePage from "@/pages/FeePage/FeePage";
import TransferPage from "@/pages/TransferPage/TransferPage";
import ActivitiesPage from "@/pages/ActivitiesPage/ActivitiesPage";
import OrgInfoPage from "@/pages/OrgInfoPage/OrgInfoPage";
import NoticePage from "@/pages/NoticePage/NoticePage";
import StatisticsPage from "@/pages/StatisticsPage/StatisticsPage";
import LoginPage from "@/pages/LoginPage/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="fee" element={<FeePage />} />
          <Route path="transfer" element={<TransferPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="org-info" element={<OrgInfoPage />} />
          <Route path="notice" element={<NoticePage />} />
          <Route path="statistics" element={<StatisticsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
