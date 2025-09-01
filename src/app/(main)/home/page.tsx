"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserData } from "@/actions/get-user-data";
import { getUserWorkspaceData } from "@/actions/workspaces";
import Sidebar from "@/components/sidebar";
import { User, Workspace } from "@/types/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Typography from "@/components/ui/typography";
import { RiHome2Fill } from "react-icons/ri";
import { PiChatsTeardrop } from "react-icons/pi";
import { IoDiamondOutline } from "react-icons/io5";
import { FaRegCalendarCheck, FaUsers, FaFileAlt } from "react-icons/fa";
import CreditLimitBanner from "@/components/credit-limit-banner";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user + workspaces
  useEffect(() => {
    async function fetchData() {
      try {
        const u = await getUserData();
        if (!u) {
          router.push("/auth");
          return;
        }
        setUser(u);

        if (u.workspaces && u.workspaces.length > 0) {
          const ws = await getUserWorkspaceData(u.workspaces);
          if (Array.isArray(ws)) {
            setWorkspaces(ws);
            setCurrentWorkspace(ws[0] ?? null);
          }
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  // --- UI states ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Typography text="Loading your dashboard..." variant="h2" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Typography
            text="No user found. Please login again."
            variant="h2"
            className="mb-4"
          />
          <Button onClick={() => router.push("/auth")}>Go to Auth</Button>
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex h-screen">
        <Sidebar
          currentWorkspaceData={null}
          userData={user}
          userWorksapcesData={workspaces}
        />
        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="max-w-4xl mx-auto text-center">
            <Typography
              text="Welcome to your dashboard!"
              variant="h1"
              className="mb-4"
            />
            <Typography
              text="You don't have any workspaces yet. Create one to get started."
              variant="p"
              className="mb-6"
            />
            <Button onClick={() => router.push("/create-workspace")}>
              Create Your First Workspace
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // --- Normal Dashboard ---
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar stays fixed height */}
      <Sidebar
        currentWorkspaceData={currentWorkspace}
        userData={user}
        userWorksapcesData={workspaces}
      />

      {/* Main scrollable content */}
      <main className="flex-1 h-screen overflow-y-auto p-8 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto pb-20">
          <div className="mb-12 text-center">
            <Typography
              text={`Welcome back, ${user.name || user.email}!`}
              variant="h1"
              className="text-4xl font-bold mb-2"
            />
            <Typography
              text="Here’s what’s happening in your workspace"
              variant="p"
              className="text-lg"
            />
          </div>

          <CreditLimitBanner userData={user} className="mb-6" />

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {user.subscription_tier}
                </div>
                <p className="text-sm text-gray-600">
                  {user.subscription_tier === "free"
                    ? `${user.credits_remaining} credits remaining`
                    : "Unlimited access"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workspaces</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workspaces.length}</div>
                <p>Active workspaces</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user.is_away ? "Inactive" : "Active"}
                </div>
                <p>{user.status_message || "No status set"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push(`/workspace/${currentWorkspace.id}`)}
                  className="w-full justify-start"
                >
                  <RiHome2Fill className="mr-2" />
                  Go to Workspace
                </Button>
                <Button
                  onClick={() => router.push("/direct-messages")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <PiChatsTeardrop className="mr-2" />
                  Direct Messages
                </Button>
                <Button
                  onClick={() => router.push("/profile")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <FaFileAlt className="mr-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium">Workspace joined</p>
                  <p className="text-sm text-gray-600">
                    {currentWorkspace.name} •{" "}
                    {new Date(
                      currentWorkspace.created_at
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium">Profile updated</p>
                  <p className="text-sm text-gray-600">
                    {user.last_activity
                      ? new Date(user.last_activity).toLocaleDateString()
                      : "Never"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upgrade CTA */}
          {user.subscription_tier === "free" && (
            <Card className="mt-8">
              <CardContent className="flex items-center justify-between">
                <Typography
                  text="Unlock Premium Features"
                  variant="h3"
                  className="font-bold"
                />
                <Button onClick={() => router.push("/upgrade")}>
                  <IoDiamondOutline className="mr-2" /> Upgrade Now
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
