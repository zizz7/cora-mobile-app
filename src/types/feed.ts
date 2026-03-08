/**
 * Feed-related type definitions.
 */

export type FeedItemType = 'staff_post' | 'external_review';
export type PostSubtype = 'post' | 'event' | 'trip' | 'job' | 'announcement' | 'mention';
export type ReviewSource = 'booking' | 'agoda' | 'holidaycheck' | 'tripadvisor' | 'google';

export interface FeedAuthor {
  name: string;
  user_id?: string | null;
  avatar_url?: string | null;
  department?: string | null;
  source?: string; // For external reviews
}

export interface FeedItem {
  id: string;
  type: FeedItemType;
  subtype: PostSubtype | ReviewSource;
  title: string | null;
  body: string;
  author: FeedAuthor;
  media_urls: string[];
  is_pinned: boolean;
  is_joinable: boolean;
  has_joined?: boolean;
  reference_id: string | null;
  rating?: number; // For external reviews
  profile_url?: string; // For external reviews
  reactions_count: number;
  has_reacted: boolean;
  meta?: Record<string, any>;
  created_at: string;
}

export interface FeedResponse {
  data: FeedItem[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ReactionResponse {
  message: string;
  action: 'added' | 'removed';
  new_count: number;
  has_reacted: boolean;
}

export interface Reactor {
  name: string;
  user_id: string | null;
  avatar_url: string | null;
  reacted_at: string;
}
