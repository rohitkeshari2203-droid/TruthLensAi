import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Flag,
  Globe2,
  FileClock,
  LayoutDashboard,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Administrative Access Denied</h2>
        <p className="text-xs text-slate-500">
          You must be authenticated with the ADMIN role to access the system administration workspace.
        </p>
        <Link
          to="/login"
          className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const navLinks = [
    { to: '/admin', label: 'Overview & Health', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/users', label: 'User Directory', icon: <Users className="w-4 h-4" /> },
    { to: '/admin/reports', label: 'Disputes & Reports', icon: <Flag className="w-4 h-4" /> },
    { to: '/admin/sources', label: 'Source Reputation', icon: <Globe2 className="w-4 h-4" /> },
    { to: '/admin/audit-logs', label: 'Audit Trail', icon: <FileClock className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-60 shrink-0 space-y-4">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              Admin Control Center
            </div>
            <p className="text-[11px] text-purple-700 mt-1">
              Authorized session: {user.email}
            </p>
          </div>

          <nav className="space-y-1">
            {navLinks.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};
