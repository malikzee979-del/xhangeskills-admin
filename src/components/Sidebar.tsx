'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/providers/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: '📊' },
  { label: 'Pending Skills', href: '/?tab=skills', icon: '✓' },
  { label: 'Categories', href: '/?tab=categories', icon: '📁' },
  { label: 'Base Skills', href: '/?tab=base-skills', icon: '🎓' },
  { label: 'Reports', href: '/?tab=reports', icon: '🚨' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <button
        className="menuToggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${isOpen ? 'sidebarOpen' : ''}`}>
        <div className="logoSection">
          <h1 className="logoTitle">XchangeSkills</h1>
          <p className="logoSubtitle">Admin Panel</p>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="navItem"
            >
              <span className="navIcon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <hr className="divider" />

        {/* User Info */}
        {user && (
          <div className="userSection">
            <p className="userLabel">Logged in as</p>
            <p className="userName">
              {user.displayName || user.username}
            </p>
            <p className="userEmail">{user.email}</p>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="logoutButton"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>

        <div className="version">
          <p className="versionItem">Backend: http://localhost:1337</p>
          <p className="versionItem">Version 1.0.0</p>
        </div>
      </aside>
    </>
  );
}
