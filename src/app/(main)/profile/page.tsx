"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserData } from "@/actions/get-user-data";
import { getUserWorkspaceData } from "@/actions/workspaces";
import Sidebar from "@/components/sidebar";
import { User, Workspace } from "@/types/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Typography from "@/components/ui/typography";
import { IoDiamondOutline } from "react-icons/io5";
import {
  FaRegCalendarCheck,
  FaEdit,
  FaSave,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaClock,
} from "react-icons/fa";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ProfilePage = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [userWorkspaces, setUserWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    status_message: "",
    is_away: false,
  });
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getUserData();
        if (!user) {
          router.push("/auth");
          return;
        }
        setUserData(user);
        setEditForm({
          name: user.name || "",
          status_message: user.status_message || "",
          is_away: user.is_away,
        });

        const workspaces = await getUserWorkspaceData(user.workspaces!);
        setUserWorkspaces(workspaces as Workspace[]);

        if (workspaces.length > 0) {
          setCurrentWorkspace(workspaces[0] as Workspace);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-dark"></div>
      </div>
    );
  }

  if (!userData || !currentWorkspace) {
    return null;
  }

  const handleSave = async () => {
    try {
      setUserData({
        ...userData,
        name: editForm.name,
        status_message: editForm.status_message,
        is_away: editForm.is_away,
        last_activity: new Date().toISOString(),
      });

      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: userData.name || "",
      status_message: userData.status_message || "",
      is_away: userData.is_away,
    });
    setEditing(false);
  };

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case "lifetime":
        return <Badge className="bg-yellow-600 text-white">Lifetime</Badge>;
      case "premium":
        return <Badge className="bg-blue-600 text-white">Premium</Badge>;
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  const getStatusIcon = (isAway: boolean) => {
    return isAway ? (
      <FaRegCalendarCheck className="text-orange-500" />
    ) : (
      <FaRegCalendarCheck className="text-green-500" />
    );
  };

  return (
    <>
      {/* Desktop layout */}
      <div className="hidden md:flex h-screen">
        {/* Sidebar fixed on the left */}
        <Sidebar
          currentWorkspaceData={currentWorkspace}
          userData={userData}
          userWorksapcesData={userWorkspaces}
        />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <Typography
              text="Profile Settings"
              variant="h1"
              className="text-3xl font-bold mb-2"
            />
            <Typography
              text="Manage your profile information and preferences"
              variant="p"
              className="text-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={userData.avatar_url} />
                      <AvatarFallback className="text-2xl">
                        {userData.name?.slice(0, 2) || userData.email.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">{userData.name || "User"}</CardTitle>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    {getSubscriptionBadge(userData.subscription_tier)}
                    {getStatusIcon(userData.is_away)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FaUser className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm text-gray-600">{userData.name || "Not set"}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FaEnvelope className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600">{userData.email}</p>
                    </div>
                  </div>

                  {userData.phone && (
                    <div className="flex items-center space-x-3">
                      <FaPhone className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-gray-600">{userData.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <FaClock className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Member since</p>
                      <p className="text-sm text-gray-600">
                        {new Date(userData.created_at || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Basic Information</CardTitle>
                    {!editing ? (
                      <Button onClick={() => setEditing(true)} variant="outline" size="sm">
                        <FaEdit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    ) : (
                      <div className="space-x-2">
                        <Button onClick={handleSave} size="sm">
                          <FaSave className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button onClick={handleCancel} variant="outline" size="sm">
                          <FaTimes className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Display Name</Label>
                    {editing ? (
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Enter your display name"
                      />
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">
                        {userData.name || "Not set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="status">Status Message</Label>
                    {editing ? (
                      <Textarea
                        id="status"
                        value={editForm.status_message}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status_message: e.target.value })
                        }
                        placeholder="What are you working on?"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">
                        {userData.status_message || "No status set"}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="away-mode"
                      checked={editForm.is_away}
                      onCheckedChange={(checked) =>
                        setEditForm({ ...editForm, is_away: checked })
                      }
                      disabled={!editing}
                    />
                    <Label htmlFor="away-mode">Show me as inactive</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="notifications" defaultChecked />
                    <Label htmlFor="notifications">Email notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="sound" defaultChecked />
                    <Label htmlFor="sound">Sound notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="desktop" />
                    <Label htmlFor="desktop">Desktop notifications</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Current Plan: {userData.subscription_tier}
                      </p>
                      <p className="text-sm text-gray-600">
                        {userData.subscription_tier === "free"
                          ? `${userData.credits_remaining} credits remaining`
                          : "Unlimited access"}
                      </p>
                    </div>
                    <Button onClick={() => router.push("/upgrade")}>
                      <IoDiamondOutline className="mr-2 h-4 w-4" />
                      {userData.subscription_tier === "free" ? "Upgrade" : "Manage"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fallback */}
      <div className="md:hidden block min-h-screen p-4">
        <Typography
          text="Please use desktop view for full functionality"
          variant="h2"
        />
      </div>
    </>
  );
};

export default ProfilePage;
