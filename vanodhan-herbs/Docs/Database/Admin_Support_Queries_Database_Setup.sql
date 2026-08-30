-- ====================================================================
-- VANODHAN HERBS — ADMIN SUPPORT QUERIES SETUP SCRIPT (V2.1)
-- Leverages existing public.get_current_user_role() helper
-- Run this script in your Supabase Dashboard -> SQL Editor
-- ====================================================================

-- 1. Unresolved Queries Counter RPC for Admin Sidebar Badge
CREATE OR REPLACE FUNCTION public.admin_get_unresolved_queries_count()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role text;
    unresolved_count INT := 0;
BEGIN
    -- Read authoritative user role
    v_role := public.get_current_user_role();
    
    -- Enforce Admin / Super Admin authorization
    IF v_role IS DISTINCT FROM 'admin' AND v_role IS DISTINCT FROM 'super_admin' THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required'
            USING errcode = 'P0001';
    END IF;

    -- Count unresolved queries (pending or in_review)
    SELECT COUNT(*) INTO unresolved_count
    FROM public.support_queries
    WHERE status IN ('pending', 'in_review');

    RETURN unresolved_count;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.admin_get_unresolved_queries_count() TO authenticated;


-- 2. Grant RLS Policies for Admin Access on public.support_queries

-- Drop old policies if existing to prevent conflicts
DROP POLICY IF EXISTS "Admins can view all support queries" ON public.support_queries;
DROP POLICY IF EXISTS "Admins can update support queries" ON public.support_queries;

-- Policy A: Admins & Super Admins can SELECT all support queries
CREATE POLICY "Admins can view all support queries"
ON public.support_queries
FOR SELECT
TO authenticated
USING (public.get_current_user_role() IN ('admin', 'super_admin'));

-- Policy B: Admins & Super Admins can UPDATE support query status and admin_notes
CREATE POLICY "Admins can update support queries"
ON public.support_queries
FOR UPDATE
TO authenticated
USING (public.get_current_user_role() IN ('admin', 'super_admin'))
WITH CHECK (public.get_current_user_role() IN ('admin', 'super_admin'));
