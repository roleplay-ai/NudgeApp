-- ============================================
-- Reconcile: tile gallery table name vs legacy apply_slides
-- ============================================
-- Older repo migrations used public.apply_slides with tile_id (Apply tiles).
-- Production DBs use public.apply_slides for task walkthroughs (task_id → apply_tasks).
--
-- If your database has the old tile-shaped apply_slides (tile_id, no task_id),
-- this renames it to public.apply_tile_slides so it matches migration_010.
-- Safe to re-run.
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'apply_slides'
      AND c.column_name = 'tile_id'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'apply_slides'
      AND c.column_name = 'task_id'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
      AND t.table_name = 'apply_tile_slides'
  ) THEN
    ALTER TABLE public.apply_slides RENAME TO apply_tile_slides;
  END IF;
END $$;

-- Normalize RLS on apply_tile_slides when that table exists
DO $$
BEGIN
  IF to_regclass('public.apply_tile_slides') IS NULL THEN
    RETURN;
  END IF;
  EXECUTE 'ALTER TABLE public.apply_tile_slides ENABLE ROW LEVEL SECURITY';
  EXECUTE 'DROP POLICY IF EXISTS "anyone reads apply slides" ON public.apply_tile_slides';
  EXECUTE 'DROP POLICY IF EXISTS "admin writes apply slides" ON public.apply_tile_slides';
  EXECUTE 'DROP POLICY IF EXISTS "anyone reads apply tile slides" ON public.apply_tile_slides';
  EXECUTE 'DROP POLICY IF EXISTS "admin writes apply tile slides" ON public.apply_tile_slides';
  EXECUTE 'CREATE POLICY "anyone reads apply tile slides" ON public.apply_tile_slides FOR SELECT USING (true)';
  EXECUTE 'CREATE POLICY "admin writes apply tile slides" ON public.apply_tile_slides FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())';
END $$;
