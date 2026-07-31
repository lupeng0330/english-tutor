import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppShell } from './components/AppShell';
import { GuestRoute, ProtectedRoute } from './components/RouteGuards';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ContentPage } from './pages/ContentPage';
import { ExamsPage } from './pages/ExamsPage';
import { UsersPage } from './pages/UsersPage';
import { MembershipPage } from './pages/MembershipPage';
import { PlansPage } from './pages/PlansPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuditPage } from './pages/AuditPage';

export default function App(){return <BrowserRouter><AuthProvider><Routes><Route element={<GuestRoute/>}><Route path="/login" element={<LoginPage/>}/></Route><Route element={<ProtectedRoute/>}><Route element={<AppShell/>}><Route index element={<DashboardPage/>}/><Route path="content" element={<ContentPage/>}/><Route path="exams" element={<ExamsPage/>}/><Route path="users" element={<UsersPage/>}/><Route path="membership" element={<MembershipPage/>}/><Route path="plans" element={<PlansPage/>}/><Route path="settings" element={<SettingsPage/>}/><Route path="audit" element={<AuditPage/>}/></Route></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes></AuthProvider></BrowserRouter>}
