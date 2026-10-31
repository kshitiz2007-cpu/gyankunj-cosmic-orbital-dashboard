-- Add bilingual body content for study resources.
alter table public.study_resources
  add column if not exists content_hi text;

-- Keep the text-resource payload constraint compatible with both languages.
alter table public.study_resources
  drop constraint if exists resource_payload_check;

alter table public.study_resources
  add constraint resource_payload_check check (
    (resource_type='text' and (content_text is not null or content_hi is not null)) or
    (resource_type in ('pdf','image') and storage_path is not null)
  );
