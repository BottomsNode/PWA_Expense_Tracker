import { useEffect, useState } from "react";

export const useDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const closeSidebarOnMobile = () => {
    if (isMobile) setSidebarOpen(false);
  };

  const navItems = [
    { label: "Overview", to: "/" },
    { label: "Add Expense", to: "/add-expense" },
    { label: "Manage Expenses", to: "/manage-expenses" },
    { label: "Daily Expense", to: "/daily" },
    { label: "Monthly Expense", to: "/monthly" },
    { label: "Analysis", to: "/analysis" },
    { label: "Settings", to: "/settings" },
  ];

  return {
    sidebarOpen,
    isMobile,
    toggleSidebar,
    closeSidebarOnMobile,
    navItems,
    setSidebarOpen,
  };
};
