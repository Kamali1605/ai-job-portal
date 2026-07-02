"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Bell,
  Activity,
  MessageSquare,
  LogOut,
  UserCircle2,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  // ✅ LOGOUT FUNCTION (MISSING BEFORE)
  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  useEffect(() => {
    const storedRole = localStorage.getItem("role");

    // 🔥 FORCE ROLE BASED ON URL
    if (pathname.startsWith("/dashboard/recruiter")) {
      setRole("recruiter");
      return;
    }

    if (pathname.startsWith("/dashboard/candidate")) {
      setRole("candidate");
      return;
    }

    if (!storedRole) {
      router.push("/login");
      return;
    }

    setRole(storedRole);
  }, [pathname, router]);

  // ⏳ WAIT UNTIL ROLE IS SET
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  // ✅ ROLE BASED NAVIGATION
  const navItems =
    role === "recruiter"
      ? [
          { href: "/dashboard/recruiter", label: "Home", icon: LayoutDashboard },
          { href: "/dashboard/recruiter/jobs", label: "My Jobs", icon: Briefcase },
          // ✅ ADD THIS
          { href: "/dashboard/recruiter/post-job", label: "Post Job", icon: FileText },
          { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
          { href: "/dashboard/activity", label: "Activity", icon: Activity },
          { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquare },
        ]
      : [
          { href: "/dashboard/candidate", label: "Home", icon: LayoutDashboard },
          { href: "/jobs", label: "Jobs", icon: Briefcase },
          {
            href: "/dashboard/candidate/applications",
            label: "My Applications",
            icon: FileText,
          },
          { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
          { href: "/dashboard/activity", label: "Activity", icon: Activity },
          { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquare },
        ];

  const NavItem = ({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: any;
}) => {
  const isHome = href === "/dashboard/recruiter" || href === "/dashboard/candidate";

  const isActive = isHome
    ? pathname === href
    : pathname.startsWith(href);

  return (
    <button
      onClick={() => router.push(href)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left ${
        isActive
          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );
};
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* 🔹 SIDEBAR */}
      <aside className="w-64 bg-white border-r p-6 flex flex-col justify-between shadow-sm">
        <div>
          <h2 className="text-xl font-bold mb-8 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Resume Analyzer
          </h2>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>
        </div>

        {/* 🔹 PROFILE + LOGOUT */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-3 mb-4">
            <UserCircle2 size={32} className="text-gray-500" />
            <div>
              <p className="text-sm font-semibold capitalize">{role}</p>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-red-500 hover:text-white text-gray-700 px-4 py-2 rounded-lg transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* 🔹 MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">{children}</main>
    </div>
  );
}