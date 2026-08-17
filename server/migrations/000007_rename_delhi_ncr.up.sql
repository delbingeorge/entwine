update candidate_profiles
set locations = array_replace(locations, 'Delhi NCR', 'Delhi')
where 'Delhi NCR' = any(locations);
