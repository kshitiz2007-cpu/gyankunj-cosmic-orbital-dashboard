-- Memory Vault card artwork: private bucket, admin-only writes, signed student reads.
begin;

alter table public.memory_cards
  add column if not exists image_path text;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'memory-card-images',
  'memory-card-images',
  false,
  8388608,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update
set public=false,
    file_size_limit=8388608,
    allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists "memory card images authenticated read" on storage.objects;
create policy "memory card images authenticated read"
on storage.objects for select to authenticated
using(bucket_id='memory-card-images');

drop policy if exists "memory card images admin insert" on storage.objects;
create policy "memory card images admin insert"
on storage.objects for insert to authenticated
with check(bucket_id='memory-card-images' and public.is_admin());

drop policy if exists "memory card images admin update" on storage.objects;
create policy "memory card images admin update"
on storage.objects for update to authenticated
using(bucket_id='memory-card-images' and public.is_admin())
with check(bucket_id='memory-card-images' and public.is_admin());

drop policy if exists "memory card images admin delete" on storage.objects;
create policy "memory card images admin delete"
on storage.objects for delete to authenticated
using(bucket_id='memory-card-images' and public.is_admin());

commit;
