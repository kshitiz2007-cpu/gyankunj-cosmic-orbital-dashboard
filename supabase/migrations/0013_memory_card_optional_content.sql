-- Allow visual-first and partial Memory Vault cards.
-- Prompt and answer fields are optional; images and/or explanation can carry the card.
begin;
alter table public.memory_cards
  alter column prompt_en drop not null,
  alter column prompt_hi drop not null,
  alter column answer_en drop not null,
  alter column answer_hi drop not null;
commit;
