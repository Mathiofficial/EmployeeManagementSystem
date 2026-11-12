
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getCurrentAppUser } from "@/lib/auth.functions";

type AppUser = Awaited<ReturnType<typeof getCurrentAppUser>>;

const Sidebar = () => {
  const [appUser, setAppUser] = useState<AppUser>(null);

  useEffect(() => {
    getCurrentAppUser()
      .then((user) => setAppUser(user))
      .catch((error) => console.error("Failed to load user:", error));
  }, []);

  const commonLinks = [
    { title: "Dashboard", path: "/dashboard" },
  ];

  const adminLinks = [
    { title: "Employees", path: "/employees" },
    { title: "Departments", path: "/departments" },
    { title: "Designations", path: "/designations" },
    { title: "Attendance", path: "/attendance" },
    { title: "Leave Management", path: "/leaves" },
    { title: "Tasks", path: "/tasks" },
  ];

  const employeeLinks = [
    { title: "My Attendance", path: "/attendance" },
    { title: "My Leaves", path: "/leaves" },
    { title: "My Tasks", path: "/my-tasks" },
    { title: "My Profile", path: "/profile" },
  ];

  const links = [
    ...commonLinks,
    ...(appUser?.role === "ADMIN" ? adminLinks : employeeLinks),
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-8">
        Employee MS
      </h1>

      <nav className="space-y-4">
        {links.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="block rounded-lg px-3 py-2 transition-colors hover:bg-slate-700"
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
