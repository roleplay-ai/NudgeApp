-- ============================================================
-- Migration 030: Clear email-derived display_name values
--
-- Old code stored the email local-part (e.g. "hitanshu.tandon21"
-- from "hitanshu.tandon21@gmail.com") directly into
-- profiles.display_name.  This one-time cleanup nulls those rows
-- so the app falls through to user_metadata or "user" instead.
--
-- Only rows where display_name exactly matches the part of the
-- email address before "@" are affected — a precise, safe condition.
-- ============================================================

UPDATE public.profiles
SET display_name = NULL
WHERE display_name IS NOT NULL
  AND display_name = split_part(email, '@', 1);
