create or replace function bump_exhibition_likes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update exhibitions
       set likes_count = likes_count + 1
     where id = new.exhibition_id;
    return new;
  elsif tg_op = 'DELETE' then
    update exhibitions
       set likes_count = greatest(likes_count - 1, 0)
     where id = old.exhibition_id;
    return old;
  end if;
  return null;
end $$;