import { NavLink } from "react-router-dom";
import { Github, HeartHandshake, Menu, X } from "lucide-react";
import { useDashboardLayout } from "@/hooks";
import { LayoutProps } from "@/props";

export const DashboardLayout = ({ children }: LayoutProps) => {
  const {
    sidebarOpen,
    isMobile,
    toggleSidebar,
    closeSidebarOnMobile,
    navItems,
  } = useDashboardLayout();

  return (
    <div className="flex min-h-screen w-full bg-linear-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden">
      {/* Sidebar */}
      {(sidebarOpen || !isMobile) && (
        <aside
          className="fixed md:relative top-0 left-0 h-full md:h-auto w-64 md:w-1/4 
                        bg-white/90 dark:bg-gray-900 backdrop-blur-xl 
                        shadow-2xl md:shadow-none z-50 flex flex-col justify-between 
                        transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 flex flex-col gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-r from-blue-500 to-indigo-600 rounded-xl mb-4">
                <HeartHandshake className="text-white w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                Expense Tracker
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mt-1">
                <HeartHandshake className="w-5 h-6 text-blue-500" />
                <span className="font-medium">Nishit Shivdasani</span>
              </p>
            </div>

            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 flex items-center gap-3 ${
                      isActive
                        ? "bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div
            className="p-4 text-xs text-gray-500 dark:text-gray-400 text-center
              border-t border-gray-200 dark:border-gray-700
              bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center"
          >
            <div className="inline-flex items-center gap-1.5">
              <span>© {new Date().getFullYear()}</span>
              <a
                href="https://github.com/BinaryStudio8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium 
                 text-blue-600 dark:text-blue-400 
                 hover:text-blue-700 dark:hover:text-blue-300 
                 transition-colors"
              >
                <Github className="w-3.5 h-3.5 -mt-px" />{" "}
                {/* tiny upward nudge for optical centering */}
                <span>BinaryStudio8</span>
              </a>
              <span>. All Rights Reserved.</span>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebarOnMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:w-3/4">
        {/* Header */}
        <header
          className="flex justify-between items-center px-4 sm:px-6 py-4 
                        bg-white/80 dark:bg-gray-900 backdrop-blur-xl 
                        shadow-lg sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700"
        >
          <button
            className="md:hidden text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? <X size={25} /> : <Menu size={24} />}
          </button>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <div className="w-8 h-8" /> {/* Spacer */}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full bg-white/50 dark:bg-gray-800/50 rounded-t-3xl md:rounded-t-none shadow-inner">
          {children}
        </main>
      </div>
    </div>
  );
};
