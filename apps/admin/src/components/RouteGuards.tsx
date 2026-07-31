import { Navigate, Outlet } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute() { const { user, loading } = useAuth(); if (loading) return <div className="grid min-h-screen place-items-center text-brand-600"><LoaderCircle className="animate-spin" /></div>; return user ? <Outlet /> : <Navigate to="/login" replace />; }
export function GuestRoute() { const { user, loading } = useAuth(); if (loading) return null; return user ? <Navigate to="/" replace /> : <Outlet />; }
