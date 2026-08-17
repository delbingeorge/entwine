update candidate_profiles
set locations = array_replace(locations, 'Delhi', 'Delhi NCR')
where 'Delhi' = any(locations);
