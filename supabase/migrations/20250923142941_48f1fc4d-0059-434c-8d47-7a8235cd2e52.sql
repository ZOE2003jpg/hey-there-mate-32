-- Update test user roles to their correct values
UPDATE profiles 
SET role = 'admin'
WHERE username = 'testadmin';

UPDATE profiles 
SET role = 'writer',
    username = 'testwriter',
    display_name = 'Test Writer'
WHERE user_id = '792d4939-fab9-4e22-87a6-0c93423753a8';