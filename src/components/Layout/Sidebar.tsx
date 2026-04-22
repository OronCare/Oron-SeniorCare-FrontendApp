import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { sidebarConfig, roleDisplay } from "../../config/sidebarConfig";
import { getFullName } from "../../types";

type Props = {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
};

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }: Props) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const links = sidebarConfig[user.role];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderLinks = () =>
    links.map((link) => {
      const isActive =
              location.pathname === link.path 

        console.log(isActive)
  
      return (
        <Link
          key={link.name}
          to={link.path}
          onClick={() => setIsMobileMenuOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? "bg-brand-600 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <link.icon
            className={`h-5 w-5 ${
              isActive ? "text-white" : "text-slate-400"
            }`}
          />
          {link.name}
        </Link>
      );
    });

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed h-full z-20">
        <div className="h-16 flex items-center px-6 py-2 border-b border-slate-800">
          <div className="flex items-center gap-2  text-brand-400">
            <Activity className="h-6 w-6" />
            <span className="text-xl font-bold text-white">
              ORON<span className="text-brand-400">Health</span>
            </span>
          </div>
        </div>

        <div className="px-6 py-2 border-b border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-1">
            Portal
          </p>
          <span className="text-sm font-medium">
            {roleDisplay[user.role]}
          </span>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">{renderLinks()}</nav>

        <div className="p-2 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <img
              src={user.avatar}
              className="h-9 w-9 rounded-full border border-slate-700"
            />
            <div>
              <p className="text-sm font-medium">{getFullName(user)}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 px-3 py-2  rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/80 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside className="fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50 md:hidden flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
              <span className="text-xl font-bold">
                ORON<span className="text-brand-400">Health</span>
              </span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              {renderLinks()}
            </nav>
             <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <img
              src={user.avatar}
              className="h-9 w-9 rounded-full border border-slate-700"
            />
            <div>
              <p className="text-sm font-medium">{getFullName(user)}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 px-3 py-2  rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;