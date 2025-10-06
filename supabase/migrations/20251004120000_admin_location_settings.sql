-- Add admin email and location configuration storage to studio_settings
alter table if exists studio_settings
  add column if not exists admin_email_configs jsonb;

alter table if exists studio_settings
  add column if not exists location_config jsonb;

update studio_settings
set admin_email_configs = '[]'::jsonb
where admin_email_configs is null;

update studio_settings
set location_config = '{}'::jsonb
where location_config is null;

alter table if exists studio_settings
  alter column admin_email_configs set default '[]'::jsonb,
  alter column admin_email_configs set not null,
  alter column location_config set default '{}'::jsonb,
  alter column location_config set not null;
