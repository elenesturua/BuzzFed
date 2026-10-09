insert into profiles (id, email, display_name) values
  ('c35fb1dd-cb28-4d40-9b78-802c7aacc214', 'buzzfed-demo@gatech.edu', 'BuzzFed Demo');

insert into events (id, name, host_org, building, room, starts_at, ends_at, created_by) values
  ('00000000-0000-0000-0000-0000000000e1',
   'GDC Info Session', 'Game Developers Club', 'Klaus Advanced Computing', '1116',
   now() - interval '1 hour', now() + interval '1 hour',
   'c35fb1dd-cb28-4d40-9b78-802c7aacc214');

insert into food_posts (
  title, description, category, dietary_tags, quantity,
  building, location_details, latitude, longitude,
  event_id, status, ai_suggested, expires_at, created_by, created_at
) values
  ('Leftover pepperoni pizza', 'About 3 boxes left from the GDC info session.',
   'pizza', '{contains_dairy}', 'lots',
   'Klaus Advanced Computing', 'Atrium, 1st floor', 33.777180777225205, -84.39579364618275,
   '00000000-0000-0000-0000-0000000000e1', 'available', false,
   now() + interval '7 days', 'c35fb1dd-cb28-4d40-9b78-802c7aacc214', now() - interval '20 minutes'),

  ('Veggie sandwich platter', 'Half a platter of assorted veggie sandwiches.',
   'sandwiches', '{vegetarian}', 'some',
   'Clough Undergraduate Commons', '2nd floor near the stairs', 33.77514322566315, -84.39648990570694,
   null, 'running_low', false,
   now() + interval '7 days', 'c35fb1dd-cb28-4d40-9b78-802c7aacc214', now() - interval '35 minutes'),

  ('Assorted cookies & brownies', 'Dessert tray from the alumni mixer.',
   'desserts', '{vegetarian,contains_nuts}', 'a_little',
   'Student Center', 'Ballroom entrance', 33.773859011882074, -84.39900045333196,
   null, 'available', true,
   now() + interval '7 days', 'c35fb1dd-cb28-4d40-9b78-802c7aacc214', now() - interval '10 minutes'),

  ('Boba & iced tea', 'Extra drinks from the ISA welcome event.',
   'drinks', '{vegan}', 'lots',
   'Instructional Center', 'Room 103', 33.775608298060824, -84.40123907501885,
   null, 'available', false,
   now() + interval '7 days', 'c35fb1dd-cb28-4d40-9b78-802c7aacc214', now() - interval '5 minutes');
