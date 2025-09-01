'use client';

import { FC, useState, useEffect } from 'react';
import { CalendarActivity } from '@/types/app';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Typography from '@/components/ui/typography';
import { 
  FaRegCalendarCheck, 
  FaMessage, 
  FaUpload, 
  FaClock
} from 'react-icons/fa6';
import { format, isToday, isYesterday } from 'date-fns';
import { FaEdit, FaFileUpload, FaUsers } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

type CalendarActivityProps = {
  userId: string;
  workspaceId: string;
  onNavigate?: () => void;
};

const CalendarActivityComponent: FC<CalendarActivityProps> = ({ userId, workspaceId, onNavigate }) => {
  const [activities, setActivities] = useState<CalendarActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Mock data for calendar activities - in a real app, this would come from the database
  useEffect(() => {
    const mockActivities: CalendarActivity[] = [
      {
        id: '1',
        user_id: userId,
        workspace_id: workspaceId,
        activity_type: 'message',
        description: 'Sent a message in #general',
        created_at: new Date().toISOString(),
        metadata: { channel_name: 'general' }
      },
      {
        id: '2',
        user_id: userId,
        workspace_id: workspaceId,
        activity_type: 'file_upload',
        description: 'Uploaded project_document.pdf',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        metadata: { file_name: 'project_document.pdf', file_size: '2.5 MB' }
      },
      {
        id: '3',
        user_id: userId,
        workspace_id: workspaceId,
        activity_type: 'status_change',
        description: 'Updated status to "In a meeting"',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        metadata: { status: 'In a meeting' }
      },
      {
        id: '4',
        user_id: userId,
        workspace_id: workspaceId,
        activity_type: 'channel_join',
        description: 'Joined #development channel',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        metadata: { channel_name: 'development' }
      }
    ];

    setActivities(mockActivities);
    setLoading(false);
  }, [userId, workspaceId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <FaMessage className="text-blue-500" />;
      case 'file_upload':
        return <FaFileUpload className="text-green-500" />;
      case 'status_change':
        return <FaEdit className="text-purple-500" />;
      case 'channel_join':
        return <FaUsers className="text-orange-500" />;
      default:
        return <FaRegCalendarCheck className="text-gray-500" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'message':
        return <Badge variant="secondary" className="text-xs">Message</Badge>;
      case 'file_upload':
        return <Badge className="bg-green-100 text-green-800 text-xs">File</Badge>;
      case 'status_change':
        return <Badge className="bg-purple-100 text-purple-800 text-xs">Status</Badge>;
      case 'channel_join':
        return <Badge className="bg-orange-100 text-orange-800 text-xs">Channel</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Activity</Badge>;
    }
  };

  const formatActivityTime = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleActivityClick = (activity: CalendarActivity) => {
    // Navigate to a sensible destination based on activity
    // Fallback to the workspace home
    onNavigate?.();
    router.push(`/workspace/${workspaceId}`);
  };

  return (
    <div className="w-80 max-h-96 overflow-y-auto dark:bg-zinc-900/40 rounded-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2 dark:text-gray-100">
          <FaRegCalendarCheck className="text-blue-500" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <FaRegCalendarCheck className="mx-auto h-8 w-8 mb-2" />
            <Typography text="No recent activity" variant="p" className="text-sm" />
          </div>
        ) : (
          activities.map((activity) => (
            <button key={activity.id} onClick={() => handleActivityClick(activity)} className="w-full text-left flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.activity_type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <Typography 
                    text={activity.description} 
                    variant="p" 
                    className="text-sm font-medium truncate dark:text-gray-100"
                  />
                  <div className="flex items-center space-x-2">
                    {getActivityBadge(activity.activity_type)}
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <FaClock className="mr-1 h-3 w-3" />
                      {formatActivityTime(activity.created_at)}
                    </div>
                  </div>
                </div>
                
                {activity.metadata && (
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {activity.metadata.channel_name && (
                      <span className="inline-block bg-gray-100 dark:bg-zinc-700 px-2 py-1 rounded mr-2">
                        #{activity.metadata.channel_name}
                      </span>
                    )}
                    {activity.metadata.file_name && (
                      <span className="inline-block bg-gray-100 dark:bg-zinc-700 px-2 py-1 rounded mr-2">
                        {activity.metadata.file_name}
                      </span>
                    )}
                    {activity.metadata.file_size && (
                      <span className="text-gray-500 dark:text-gray-400">
                        {activity.metadata.file_size}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
        
        <div className="pt-2 border-t">
          <button onClick={() => { onNavigate?.(); router.push(`/workspace/${workspaceId}`); }} className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2">
            View All Activity
          </button>
        </div>
      </CardContent>
    </div>
  );
};

export default CalendarActivityComponent;
