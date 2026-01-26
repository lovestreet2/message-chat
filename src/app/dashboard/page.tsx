"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import QuickActions from "@/components/QuickActions";
import RecentActivity from "@/components/RecentActivity";
import {
  MessageSquare,
  Users,
  Inbox,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#020b2d] to-[#0a3cff]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-[#020617] via-[#020b2d] to-[#0a3cff] text-white">
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto lg:ml-64">
        <div className="p-4 sm:p-6 space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0a3cff] via-[#00c6ff] to-[#0a3cff] py-2 px-4 rounded-xl shadow-lg inline-block">
                Dashboard
              </h1>
              <p className="text-white/70 mt-1">
                Welcome back, {session?.user?.name || session?.user?.email || "User"}!
              </p>
            </div>
            <div className="text-sm text-white/60">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Messages"
              value="1,234"
              icon={MessageSquare}
              trend={{ value: 12, label: "vs last month", isPositive: true }}
              description="All time messages"

            />
            <StatCard
              title="Active Chats"
              value="24"
              icon={Inbox}
              trend={{ value: 8, label: "new today", isPositive: true }}
              description="Currently active"

            />
            <StatCard
              title="Contacts"
              value="156"
              icon={Users}
              trend={{ value: 5, label: "this week", isPositive: true }}
              description="Total contacts"

            />
            <StatCard
              title="Growth Rate"
              value="18%"
              icon={TrendingUp}
              trend={{ value: 3, label: "vs last month", isPositive: true }}
              description="User engagement"

            />
          </div>

          {/* Quick Actions and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <QuickActions
              />
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
              <RecentActivity />
            </div>
          </div>

          {/* Overview / Additional Section */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Overview</h2>
            <p className="text-white/70">
              Your messaging activity and statistics are displayed above. Use
              quick actions to start new conversations or manage your account.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
