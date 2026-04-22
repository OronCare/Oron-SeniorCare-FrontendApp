import React, { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Bell, ChevronRight } from "lucide-react";

type Props = {
  setIsMobileMenuOpen: (value: boolean) => void;
};

const Header = ({ setIsMobileMenuOpen }: Props) => {
  const location = useLocation();

  const paths = location.pathname.split("/").filter(Boolean);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden text-slate-500"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="hidden sm:flex items-center text-sm">
          {paths.map((path, index) => {
            const currentPath =
              "/" + paths.slice(0, index + 1).join("/");

            const isLast = index === paths.length - 1;

            return (
              <Fragment key={currentPath}>
                {isLast ? (
                  <span className="font-semibold text-slate-900">
                    {path}
                  </span>
                ) : (
                  <Link to={currentPath} className="text-slate-500">
                    {path}
                  </Link>
                )}

                {!isLast && (
                  <ChevronRight className="h-4 w-4 mx-2 text-slate-400" />
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
        <Bell className="h-5 w-5" />
      </button>
    </header>
  );
};

export default Header;