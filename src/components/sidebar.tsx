'use client';

import { FC, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { GoDot, GoDotFill } from 'react-icons/go';
import { GiNightSleep } from 'react-icons/gi';
import { FaPencil } from 'react-icons/fa6';
import { IoDiamondOutline } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import { createClient } from '@/supabase/supabaseClient';
import { toast } from 'sonner';

import { User, Workspace } from '@/types/app';
import SidebarNav from '@/components/sidebar-nav';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useColorPrefrences } from '@/providers/color-prefrences';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Typography from '@/components/ui/typography';
import { FaRegCalendarCheck } from 'react-icons/fa';
import PreferencesDialog from '@/components/preferences-dialog';
import CalendarActivityComponent from '@/components/calendar-activity';

type SidebarProps = {
  userWorksapcesData: Workspace[];
  currentWorkspaceData: Workspace | null;
  userData: User;
};

const Sidebar: FC<SidebarProps> = ({
  userWorksapcesData,
  currentWorkspaceData,
  userData,
}) => {
  const { color } = useColorPrefrences();
  const router = useRouter();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  let backgroundColor = 'bg-primary-dark';
  if (color === 'green') {
    backgroundColor = 'bg-green-700';
  } else if (color === 'blue') {
    backgroundColor = 'bg-blue-700';
  }

  const handleStatusToggle = async () => {
    if (isUpdatingStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      // In a real app, this would update the user status in the database
      // For now, we'll just show a toast message
      const newStatus = !userData.is_away;
      toast.success(`Status updated to ${newStatus ? 'inactive' : 'active'}`);
      
      // Update local state (in a real app, this would come from the database)
      // You would need to implement a proper state management solution here
      
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleClearStatus = async () => {
    try {
      // In a real app, this would clear the user status in the database
      toast.success('Status cleared');
      
      // Update local state (in a real app, this would come from the database)
      // You would need to implement a proper state management solution here
      
    } catch (error) {
      toast.error('Failed to clear status');
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Failed to sign out');
        return;
      }
      
      toast.success('Signed out successfully');
      router.push('/auth');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleUpgradeClick = () => {
    router.push('/upgrade');
  };

  const handleCalendarClick = () => {
    setShowCalendar(!showCalendar);
  };

  return (
    <aside
      className={`
      fixed
      top-0
      left-0
      pt-[68px]
      pb-8
      z-30
      flex
      flex-col
      justify-between
      items-center
      h-screen
      w-20
  `}
    >
      <SidebarNav
        currentWorkspaceData={currentWorkspaceData}
        userWorkspacesData={userWorksapcesData}
      />

      <div className='flex flex-col space-y-3'>
        <div
          className={`
          bg-[rgba(255,255,255,0.3)] cursor-pointer transition-all duration-300
          hover:scale-110 text-white grid place-content-center rounded-full w-10 h-10
          `}
        >
          <FiPlus size={28} />
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Popover>
                  <PopoverTrigger>
                    <div className='h-10 w-10 relative cursor-pointer'>
                      <div className='h-full w-full rounded-lg overflow-hidden'>
                        <Image
                          className='object-cover w-full h-full'
                          src={userData.avatar_url}
                          alt={userData.name || 'user'}
                          width={300}
                          height={300}
                        />
                        <div
                          className={cn(
                            'absolute z-10 rounded-full -right-[20%] -bottom-1',
                            backgroundColor
                          )}
                        >
                          {userData.is_away ? (
                            <GoDot className='text-white text-xl' />
                          ) : (
                            <GoDotFill className='text-green-600' size={17} />
                          )}
                        </div>
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent side='right'>
                    <div>
                      <div className='flex space-x-3'>
                        <Avatar>
                          <AvatarImage src={userData.avatar_url} />
                          <AvatarFallback>
                            {userData.name && userData.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                          <Typography
                            text={userData.name || userData.email}
                            variant='p'
                            className='font-bold'
                          />
                          <div className='flex items-center space-x-1'>
                            {userData.is_away ? (
                              <GiNightSleep size='12' />
                            ) : (
                              <GoDotFill className='text-green-600' size='17' />
                            )}
                            <span className='text-xs'>
                              {userData.is_away ? 'Inactive' : 'Active'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='border group cursor-pointer mt-4 mb-2 p-1 rounded flex items-center space-x-2'>
                        <FaRegCalendarCheck className='group-hover:hidden' />
                        <FaPencil className='hidden group-hover:block' />
                        <Typography
                          text={'In a meeting'}
                          variant='p'
                          className='text-xs text-gray-600'
                        />
                      </div>
                      <div className='flex flex-col space-y-1'>
                        <Typography
                          variant='p'
                          text={
                            userData.is_away
                              ? 'Show me as active'
                              : 'Show me as inactive'
                          }
                          className='hover:text-white hover:bg-blue-700 px-2 py-1 rounded cursor-pointer'
                          onClick={handleStatusToggle}
                        />
                        <Typography
                          variant='p'
                          text={'Clear Status'}
                          className='hover:text-white hover:bg-blue-700 px-2 py-1 rounded cursor-pointer'
                          onClick={handleClearStatus}
                        />
                        <hr className='bg-gray-400' />
                        <Typography
                          variant='p'
                          text={'Profile'}
                          className='hover:text-white hover:bg-blue-700 px-2 py-1 rounded cursor-pointer'
                          onClick={handleProfileClick}
                        />
                        <div 
                          className='flex gap-2 items-center hover:text-white hover:bg-blue-700 px-2 py-1 rounded cursor-pointer'
                          onClick={handleCalendarClick}
                        >
                          <FaRegCalendarCheck />
                          <Typography
                            variant='p'
                            text='Calendar Activity'
                            className='text-xs'
                          />
                        </div>
                        <PreferencesDialog />
                        <hr className='bg-gray-400' />
                        <div 
                          className='flex gap-2 items-center hover:text-white hover:bg-blue-700 px-2 py-1 rounded cursor-pointer'
                          onClick={handleUpgradeClick}
                        >
                          <IoDiamondOutline className='text-yellow-400' />
                          <Typography
                            variant='p'
                            text={`Upgrade ${currentWorkspaceData?.name || 'Workspace'}`}
                            className='text-xs'
                          />
                        </div>
                        <Typography
                          variant='p'
                          text={`Sign out of ${currentWorkspaceData?.name || 'Workspace'}`}
                          className='hover:text-white hover:bg-blue-700 px-2 py-1 rounded cursor-pointer'
                          onClick={handleSignOut}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </TooltipTrigger>
            <TooltipContent
              className='text-white bg-black border-black'
              side='right'
            >
              <Typography text={userData.name || userData.email} variant='p' />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Calendar Activity Popover */}
        {showCalendar && currentWorkspaceData && (
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverContent side='right' className="p-0">
              <CalendarActivityComponent 
                userId={userData.id} 
                workspaceId={currentWorkspaceData.id}
                onNavigate={() => setShowCalendar(false)} 
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
