-- Publish Aether Liquid Glass / Pastel Lilac as the default app-wide appearance.
-- Safe to re-run: updates only the single global appearance record.
update public.app_theme_settings
set settings = jsonb_set(
  coalesce(settings, '{}'::jsonb),
  '{palette}',
  '"lilac"'::jsonb,
  true
),
updated_at = now()
where id = 'global';

-- Keep the remaining design controls on the Aether material defaults.
update public.app_theme_settings
set settings = coalesce(settings, '{}'::jsonb)
  || jsonb_build_object(
    'style','cosmic',
    'theme','dark',
    'glass','frosted',
    'glassIntensity',78
  ),
  updated_at = now()
where id = 'global';
