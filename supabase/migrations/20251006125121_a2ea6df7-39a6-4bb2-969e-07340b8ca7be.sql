-- Fix notification type for followers
-- Update the function to use 'follower' instead of 'new_follower'
CREATE OR REPLACE FUNCTION public.update_follower_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower count
    UPDATE writer_stats 
    SET total_followers = (
      SELECT COUNT(*) FROM followers WHERE following_id = NEW.following_id
    ),
    updated_at = now()
    WHERE user_id = NEW.following_id;
    
    -- Create notification for new follower using correct type
    PERFORM create_notification(
      NEW.following_id,
      'follower',
      'New Follower',
      'Someone started following you!',
      NULL,
      NULL
    );
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower count
    UPDATE writer_stats 
    SET total_followers = (
      SELECT COUNT(*) FROM followers WHERE following_id = OLD.following_id
    ),
    updated_at = now()
    WHERE user_id = OLD.following_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;