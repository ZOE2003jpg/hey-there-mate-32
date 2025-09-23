-- Insert test user profiles with known UUIDs for testing
-- These UUIDs will be used when creating the actual auth users

-- Test Writer User
INSERT INTO public.profiles (
  id,
  user_id, 
  username, 
  display_name, 
  bio, 
  role, 
  status
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'testwriter',
  'Test Writer',
  'I am a test writer account for testing the platform.',
  'writer',
  'active'
) ON CONFLICT (user_id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- Test Reader User  
INSERT INTO public.profiles (
  id,
  user_id,
  username,
  display_name, 
  bio,
  role,
  status
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'testreader',
  'Test Reader',
  'I am a test reader account for testing the platform.',
  'reader', 
  'active'
) ON CONFLICT (user_id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- Test Admin User
INSERT INTO public.profiles (
  id,
  user_id,
  username,
  display_name,
  bio, 
  role,
  status
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  'testadmin',
  'Test Admin',
  'I am a test admin account for testing the platform.',
  'admin',
  'active'
) ON CONFLICT (user_id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- Insert test stories for the writer
INSERT INTO public.stories (
  id,
  author_id,
  title,
  description,
  genre,
  status,
  view_count,
  like_count,
  comment_count
) VALUES 
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'The Digital Nomad Chronicles',
  'A thrilling adventure of a programmer who discovers hidden secrets in code.',
  'Sci-Fi',
  'published',
  150,
  25,
  8
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
  '11111111-1111-1111-1111-111111111111',
  'Coffee Shop Mysteries',
  'Strange things happen at the corner coffee shop every Tuesday.',
  'Mystery',
  'published',
  89,
  12,
  3
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '11111111-1111-1111-1111-111111111111', 
  'Work in Progress',
  'This story is still being written.',
  'Drama',
  'draft',
  0,
  0,
  0
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  genre = EXCLUDED.genre,
  status = EXCLUDED.status;

-- Insert test chapters for the published stories
INSERT INTO public.chapters (
  id,
  story_id,
  chapter_number,
  title,
  content,
  status,
  view_count,
  word_count,
  slide_count
) VALUES
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  1,
  'The Discovery',
  'Chapter 1 content: It was a dark and stormy night when Sarah first noticed the strange patterns in her code...',
  'published',
  50,
  850,
  10
),
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  2,
  'The Investigation',
  'Chapter 2 content: The next morning, Sarah decided to investigate further...',
  'published',
  35,
  920,
  12
),
(
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  1,
  'Tuesday Morning',
  'Chapter 1 content: Every Tuesday at exactly 9:15 AM, the coffee machine would make a sound...',
  'published',
  25,
  650,
  8
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  status = EXCLUDED.status;

-- Insert test slides for chapters
INSERT INTO public.slides (
  id,
  chapter_id,
  slide_number,
  content
) VALUES
-- Slides for Digital Nomad Chronicles Chapter 1
('slide001-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 1, 'It was a dark and stormy night...'),
('slide002-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 2, 'Sarah sat at her computer, lines of code flowing across her screen.'),
('slide003-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 3, 'Something was different about tonight. The patterns seemed... alive.'),
-- Slides for Coffee Shop Chapter 1  
('slide004-1111-1111-1111-111111111111', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 1, 'Every Tuesday at exactly 9:15 AM...'),
('slide005-1111-1111-1111-111111111111', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 2, 'The coffee machine would make a sound that defied explanation.')
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;

-- Insert test library entries for reader
INSERT INTO public.library (
  id,
  user_id,
  story_id
) VALUES
(
  'lib11111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
),
(
  'lib22222-2222-2222-2222-222222222222', 
  '22222222-2222-2222-2222-222222222222',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
) ON CONFLICT (id) DO UPDATE SET story_id = EXCLUDED.story_id;

-- Insert test reading progress
INSERT INTO public.reads (
  id,
  user_id,
  story_id,
  chapter_id,
  slide_id,
  progress,
  last_read_at
) VALUES
(
  'read1111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'slide002-1111-1111-1111-111111111111',
  65.5,
  now()
),
(
  'read2222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222', 
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'slide005-1111-1111-1111-111111111111',
  100.0,
  now() - interval '2 days'
) ON CONFLICT (id) DO UPDATE SET 
  progress = EXCLUDED.progress,
  last_read_at = EXCLUDED.last_read_at;

-- Insert test comments
INSERT INTO public.comments (
  id,
  user_id,
  story_id,
  chapter_id,
  content
) VALUES
(
  'comm1111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'This is a fascinating start! Can''t wait to see where this goes.'
),
(
  'comm2222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'The coffee shop mystery is so intriguing!'
) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;

-- Insert test likes
INSERT INTO public.likes (
  id,
  user_id, 
  story_id
) VALUES
(
  'like1111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
),
(
  'like2222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
) ON CONFLICT (id) DO UPDATE SET story_id = EXCLUDED.story_id;