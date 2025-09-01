'use client';

import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/actions/get-user-data';
import { getCurrentWorksaceData, getUserWorkspaceData } from '@/actions/workspaces';
import Sidebar from '@/components/sidebar';
import { User, Workspace } from '@/types/app';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Typography from '@/components/ui/typography';
import { PiChatsTeardrop } from 'react-icons/pi';
import { IoDiamondOutline } from 'react-icons/io5';
import { FaSearch, FaPlus, FaRegClock } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';

const DirectMessagesPage = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [userWorkspaces, setUserWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<User[]>([]);
  const router = useRouter();

  // Members are fetched from the current workspace (no dummy data)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getUserData();
        if (!user) {
          router.push('/auth');
          return;
        }
        setUserData(user);

        const workspacesResult = await getUserWorkspaceData(user.workspaces!);

        // Workspaces API now returns a flat Workspace[]
        const validWorkspaces: Workspace[] = Array.isArray(workspacesResult)
          ? (workspacesResult as Workspace[])
          : [];

        setUserWorkspaces(validWorkspaces);
        const initial = validWorkspaces[0] ?? null;
        setCurrentWorkspace(initial);

        if (initial) {
          const full = await getCurrentWorksaceData(initial.id);
          const workspaceMembers = (full?.members ?? []) as User[];
          setMembers(
            workspaceMembers.filter((m: User) => m && m.id !== user.id)
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/auth');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-dark"></div>
      </div>
    );
  }

  if (!userData || !currentWorkspace) {
    return null;
  }

  const filteredMembers = members.filter(member =>
    (member.name ?? member.email)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const startNewConversation = () => {
    if (!currentWorkspace) return;
    // If there's a search active, start with the first matching member
    const target = members
      .filter(m => (m.name ?? m.email).toLowerCase().includes(searchQuery.toLowerCase()))[0];
    if (target) {
      router.push(`/workspace/${currentWorkspace.id}/direct-message/${target.id}`);
    }
  };

  const openConversation = (memberId: string) => {
    if (!currentWorkspace) return;
    router.push(`/workspace/${currentWorkspace.id}/direct-message/${memberId}`);
  };

  return (
    <>
      <div className='hidden md:block'>
        <Sidebar
          currentWorkspaceData={currentWorkspace}
          userData={userData}
          userWorksapcesData={userWorkspaces}
        />
        
        <div className="p-8">
          <div className="mb-8">
            <Typography 
              text="Direct Messages" 
              variant="h1" 
              className="text-3xl font-bold mb-2"
            />
            <Typography 
              text="Chat privately with your team members" 
              variant="p" 
              className="text-gray-600"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={startNewConversation}>
                <FaPlus className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <Card 
                key={member.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openConversation(member.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback>
                        {member.name?.slice(0, 2) || member.email.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Typography 
                          text={member.name || member.email} 
                          variant="p" 
                          className="font-semibold truncate"
                        />
                        <div className="flex items-center space-x-2">
                          {member.is_away && (
                            <Badge className="bg-orange-600 text-white text-xs">Inactive</Badge>
                          )}
                        </div>
                      </div>
                      
                      <Typography text={member.status_message || member.email} variant="p" className="text-sm text-gray-600 truncate mb-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <PiChatsTeardrop className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <Typography 
                  text="No conversations found" 
                  variant="h3" 
                  className="text-lg font-medium text-gray-900 mb-2"
                />
                <Typography 
                  text="Try adjusting your search or start a new conversation" 
                  variant="p" 
                  className="text-gray-600"
                />
              </CardContent>
            </Card>
          )}

          {userData.subscription_tier === 'free' && (
            <Card className="mt-6 border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography 
                      text="Upgrade to Premium" 
                      variant="h3" 
                      className="text-lg font-semibold text-yellow-800 mb-2"
                    />
                    <Typography 
                      text="Get unlimited direct messages and advanced features" 
                      variant="p" 
                      className="text-yellow-700"
                    />
                  </div>
                  <Button 
                    onClick={() => router.push('/upgrade')}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <IoDiamondOutline className="mr-2 h-4 w-4" />
                    Upgrade Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <div className='md:hidden block min-h-screen p-4'>
        <Typography text="Please use desktop view for full functionality" variant="h2" />
      </div>
    </>
  );
};

export default DirectMessagesPage;