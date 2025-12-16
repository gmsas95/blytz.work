-- Chat System Schema Addition for Hyred
-- Add these to the existing PostgreSQL database

-- Chat Rooms for conversations between users
CREATE TABLE IF NOT EXISTS chat_rooms (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant2_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'support')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure each pair can only have one chat room
CREATE UNIQUE INDEX IF NOT EXISTS chat_rooms_participant_pair ON chat_rooms 
USING btree (LEAST(participant1_id, participant2_id), GREATEST(participant1_id, participant2_id));

-- Messages within chat rooms
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR(255) NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'system')),
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS messages_room_id_created_at ON messages(room_id, created_at);
CREATE INDEX IF NOT EXISTS messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_created_at ON messages(created_at);

-- Update existing users table to add chat-related fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS device_tokens JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS mobile_preferences JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS last_platform VARCHAR(20),
ADD COLUMN IF NOT EXISTS last_app_version VARCHAR(20);

-- Push notifications tracking
CREATE TABLE IF NOT EXISTS push_notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android')),
  notification_type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  clicked_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'sent'
);

-- Mobile sessions tracking
CREATE TABLE IF NOT EXISTS mobile_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) UNIQUE NOT NULL,
  platform VARCHAR(20) NOT NULL,
  app_version VARCHAR(20),
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offline sync queue for mobile
CREATE TABLE IF NOT EXISTS sync_queue (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  operation VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255),
  data JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  error_message TEXT
);

-- Create indexes for sync queue
CREATE INDEX IF NOT EXISTS sync_queue_user_status ON sync_queue(user_id, status);
CREATE INDEX IF NOT EXISTS sync_queue_created_at ON sync_queue(created_at);

-- Update Prisma schema relations
-- These would be added to the Prisma schema file
-- Chat room relations for users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS chatRooms1 ChatRoom[] @relation("participant1"),
ADD COLUMN IF NOT EXISTS chatRooms2 ChatRoom[] @relation("participant2"),
ADD COLUMN IF NOT EXISTS messages Message[] @relation("messages");