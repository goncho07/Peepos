import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import QRScannerPage from './pages/QRScannerPage';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import AccessTypePage from './pages/AccessTypePage';
import { useAuthStore } from './store/authStore';
import MatriculaPage from './pages/MatriculaPage';
import EnrollmentPage from './pages/EnrollmentPage';
import DocumentReviewPage from './pages/DocumentReviewPage';
import PaymentsPage from './pages/PaymentsPage';
import CurriculumPlannerPage from './pages/CurriculumPlannerPage';
import EvaluationManagerPage from './pages/EvaluationManagerPage';
import MessagingPage from './pages/MessagingPage';
import AcademicoPage from './pages/AcademicoPage';
import AsistenciaPage from './pages/modules/AsistenciaPage';
import PlaceholderPage from './pages/PlaceholderPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import { Users, MessageSquare, FileText, BookOpen, Settings, HelpCircle } from 'lucide-react';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationToast from './components/notifications/NotificationToast';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const AppContent: React.FC = () => {
    const location = useLocation();
    const { user } = useAuthStore();

    return (
        <NotificationProvider userId={user?.id?.toString()}>
            <PermissionsProvider>
                <Layout>
                <AnimatePresence mode="wait">
                <motion.main
                    key={location.pathname}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, duration: 0.3 }}
                    className="h-full w-full"
                >
                    <Routes location={location}>
                        {/* Implemented Pages */}
                        <Route path="/" element={
                            <ProtectedRoute requiredModule="dashboard" requiredAction="view">
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/matricula" element={
                            <ProtectedRoute requiredModule="enrollment" requiredAction="view">
                                <MatriculaPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/asistencia/scan" element={<QRScannerPage />} />
                        <Route path="/usuarios" element={
                            <ProtectedRoute requiredModule="users" requiredAction="view">
                                <UsersPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/enrollment" element={
                            <ProtectedRoute requiredModule="enrollment" requiredAction="view">
                                <EnrollmentPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/documents/review" element={
              <ProtectedRoute requiredModule="enrollment" requiredAction="review">
                <DocumentReviewPage />
              </ProtectedRoute>
            } />
            <Route path="/payments" element={
              <ProtectedRoute requiredModule="finance" requiredAction="view">
                <PaymentsPage />
              </ProtectedRoute>
            } />
            <Route path="/academico/planificacion-curricular" element={
              <ProtectedRoute requiredModule="academic" requiredAction="manage">
                <CurriculumPlannerPage />
              </ProtectedRoute>
            } />
            <Route path="/academico/evaluaciones" element={
              <ProtectedRoute requiredModule="academic" requiredAction="manage">
                <EvaluationManagerPage />
              </ProtectedRoute>
            } />
            <Route path="/messaging" element={
              <ProtectedRoute requiredModule="communication" requiredAction="access">
                <MessagingPage />
              </ProtectedRoute>
            } />

                        {/* New Director's Academic Module */}
                        <Route path="/academico" element={
                            <ProtectedRoute requiredModule="academic" requiredAction="view">
                                <AcademicoPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/academico/avance-docentes" element={<PlaceholderPage title="Avance Docentes" description="Monitoreo del progreso curricular por docente" icon={Users} />} />
                        <Route path="/academico/monitoreo-cursos" element={<PlaceholderPage title="Monitoreo de Cursos" description="Seguimiento del avance por materia y grado" icon={BookOpen} />} />
                        <Route path="/academico/monitoreo-estudiantes" element={<PlaceholderPage title="Monitoreo Estudiantes" description="Seguimiento del rendimiento estudiantil" icon={Users} />} />
                        <Route path="/academico/actas-certificados" element={<PlaceholderPage title="Actas y Certificados" description="Gestión de documentos académicos oficiales" icon={FileText} />} />
                        <Route path="/academico/reportes" element={<PlaceholderPage title="Reportes Académicos" description="Informes y estadísticas del rendimiento" icon={FileText} />} />
                        <Route path="/academico/configuracion" element={<PlaceholderPage title="Configuración Académica" description="Configuración de períodos, materias y criterios" icon={Settings} />} />

                        {/* Role-specific Dashboards */}
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/student" element={<StudentDashboard />} />
                        <Route path="/teacher" element={<TeacherDashboard />} />

                        {/* Placeholder/Other Pages */}
                        <Route path="/asistencia" element={
                            <ProtectedRoute requiredModule="attendance" requiredAction="view">
                                <AsistenciaPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/comunicaciones" element={<PlaceholderPage title="Comunicaciones" description="Sistema de mensajería y notificaciones" icon={MessageSquare} />} />
                        <Route path="/reportes" element={<PlaceholderPage title="Reportes" description="Generación de reportes y estadísticas" icon={FileText} />} />
                        <Route path="/recursos" element={<PlaceholderPage title="Recursos" description="Gestión de recursos educativos" icon={BookOpen} />} />
                        <Route path="/ayuda" element={<PlaceholderPage title="Ayuda" description="Centro de ayuda y documentación" icon={HelpCircle} />} />
                        
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </motion.main>
                </AnimatePresence>
                <NotificationToast />
                </Layout>
            </PermissionsProvider>
        </NotificationProvider>
    );
};

const App: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      {isAuthenticated ? (
        <Route path="/*" element={<AppContent />} />
      ) : (
        <>
          <Route path="/access" element={<AccessTypePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/access" replace />} />
        </>
      )}
    </Routes>
  );
};

export default App;