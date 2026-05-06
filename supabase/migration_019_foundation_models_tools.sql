-- Migration 019 (Step 1): Add "Foundation Models" to the tool_category enum
-- Run this first, then run migration_019b to insert the tools.

alter type tool_category add value if not exists 'Foundation Models';
