import { NextApiResponse } from 'next';
import { Server as NetServer, Socket } from 'net';
import { Server as SocketIOServer } from 'socket.io';

export type User = {
  avatar_url: string;
  channels: string[] | null;
  created_at: string | null;
  email: string;
  id: string;
  is_away: boolean;
  name: string | null;
  phone: string | null;
  type: string | null;
  workspaces: string[] | null;
  subscription_tier: 'free' | 'premium' | 'lifetime';
  credits_remaining: number;
  status_message: string | null;
  last_activity: string | null;
};

export type Workspace = {
  channels: string[] | null;
  created_at: string;
  id: string;
  image_url: string | null;
  invite_code: string | null;
  members: User[] | null;
  name: string;
  regulators: string[] | null;
  slug: string;
  super_admin: string;
  subscription_tier: 'free' | 'premium' | 'lifetime';
};

export type Channel = {
  id: string;
  members: string[] | null;
  name: string;
  regulators: string[] | null;
  user_id: string;
  workspace_id: string;
  created_at: string;
};

export type Messages = {
  channel_id: string;
  content: string | null;
  created_at: string;
  file_url: string | null;
  id: string;
  is_deleted: boolean;
  updated_at: string;
  user_id: string;
  workspace_id: string;
};

export type MessageWithUser = Messages & { user: User };

export type SockerIoApiResponse = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  duration: '6months' | 'lifetime';
  price_kes: number;
  features: string[];
  credits_per_month?: number;
};

export type MpesaPayment = {
  id: string;
  user_id: string;
  workspace_id: string;
  amount: number;
  phone_number: string;
  status: 'pending' | 'successful' | 'failed';
  checkout_request_id: string;
  created_at: string;
  subscription_plan_id: string;
};

export type CalendarActivity = {
  id: string;
  user_id: string;
  workspace_id: string;
  activity_type: 'message' | 'file_upload' | 'channel_join' | 'status_change';
  description: string;
  created_at: string;
  metadata?: Record<string, any>;
};
