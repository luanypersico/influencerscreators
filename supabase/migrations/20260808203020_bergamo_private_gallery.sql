-- Clean Bergamo reference images are private. The browser receives only
-- short-lived signed URLs after server-side authorization.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'bergamo-private-gallery',
  'bergamo-private-gallery',
  false,
  5242880,
  array['image/jpeg']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No anon/authenticated storage.objects policies are created intentionally.
-- Uploads and URL signing are performed only by the trusted server runtime.
