-- ============================================================================
-- AGENTIC CINEMA — SUPABASE (POSTGRESQL) SCHEMA WITH AUTHENTICATION
-- ============================================================================
-- Supports:
-- 1. Full Supabase Auth integration (email/password, magic link, OAuth)
-- 2. User-isolated projects, scratchpads, and revision snapshots
-- 3. Anonymous/guest sandbox mode for instant demo walkthroughs
-- ============================================================================

-- 1. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    genre TEXT,
    premise TEXT,
    scene_title TEXT,
    scene_summary TEXT,
    screenplay_text TEXT,
    director_style TEXT,
    core_secret TEXT,
    primary_location TEXT,
    target_territories JSONB DEFAULT '[]'::jsonb,
    narrative_format TEXT DEFAULT 'feature',
    target_runtime_minutes INTEGER DEFAULT 105,
    scene_placement_seconds INTEGER DEFAULT 1800,
    scene_duration_seconds INTEGER DEFAULT 180,
    characters JSONB DEFAULT '[]'::jsonb,
    initial_events JSONB DEFAULT '[]'::jsonb,
    nodes JSONB DEFAULT '[]'::jsonb,
    edges JSONB DEFAULT '[]'::jsonb,
    is_custom BOOLEAN DEFAULT true,
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);

-- 2. SCRATCHPAD NOTES TABLE
CREATE TABLE IF NOT EXISTS public.scratchpad_notes (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    category TEXT DEFAULT 'concept',
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE INDEX IF NOT EXISTS idx_scratchpad_user ON public.scratchpad_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_scratchpad_project ON public.scratchpad_notes(project_id);

-- 3. TALENT VAULT TABLE (Saved Custom Characters)
CREATE TABLE IF NOT EXISTS public.talent_vault (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    archetype TEXT,
    speech_style TEXT,
    subtext_ratio TEXT,
    actor_comp TEXT,
    objective TEXT,
    dials_summary TEXT,
    quirks JSONB DEFAULT '[]'::jsonb,
    role TEXT,
    personality_preset TEXT,
    confidence REAL DEFAULT 0.7,
    verbal_pacing REAL DEFAULT 0.5,
    image_url TEXT,
    full_body_image_url TEXT,
    visual_description TEXT,
    wardrobe TEXT,
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE INDEX IF NOT EXISTS idx_talent_user ON public.talent_vault(user_id);

-- 4. PROJECT REVISION SNAPSHOTS TABLE (Graph Version History)
CREATE TABLE IF NOT EXISTS public.project_snapshots (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    display_time TEXT,
    summary TEXT,
    description TEXT,
    category TEXT,
    snapshot JSONB NOT NULL,
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE INDEX IF NOT EXISTS idx_snapshots_project ON public.project_snapshots(project_id, created_at DESC);

-- 5. GENERATION CACHE TABLE (Server-Side Persistent AI Cache)
CREATE TABLE IF NOT EXISTS public.generation_cache (
    key TEXT PRIMARY KEY,
    namespace TEXT NOT NULL,
    payload JSONB,
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generation_cache_namespace ON public.generation_cache(namespace);

-- 6. ASSETS TABLE (Media Library, Floor Plans, Character References, Footage)
CREATE TABLE IF NOT EXISTS public.assets (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'image', 'video', 'map', 'audio'
    category TEXT NOT NULL, -- 'map', 'character_face', 'character_body', 'location', 'style', 'video', 'audio', 'general'
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    size_bytes BIGINT DEFAULT 0,
    mime_type TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE INDEX IF NOT EXISTS idx_assets_user ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_project ON public.assets(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON public.assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_created ON public.assets(created_at DESC);

-- ============================================================================
-- SUPABASE STORAGE BUCKET CONFIGURATION
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('cinema_assets', 'cinema_assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scratchpad_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Drop old policies if refreshing
    DROP POLICY IF EXISTS "Allow public read/write projects" ON public.projects;
    DROP POLICY IF EXISTS "Allow public read/write scratchpad" ON public.scratchpad_notes;
    DROP POLICY IF EXISTS "Allow public read/write talent" ON public.talent_vault;
    DROP POLICY IF EXISTS "Allow public read/write snapshots" ON public.project_snapshots;
    DROP POLICY IF EXISTS "Allow public read/write cache" ON public.generation_cache;
    DROP POLICY IF EXISTS "Projects access policy" ON public.projects;
    DROP POLICY IF EXISTS "Scratchpad access policy" ON public.scratchpad_notes;
    DROP POLICY IF EXISTS "Talent access policy" ON public.talent_vault;
    DROP POLICY IF EXISTS "Snapshots access policy" ON public.project_snapshots;
    DROP POLICY IF EXISTS "Assets access policy" ON public.assets;

    -- Flexible policies: Authenticated users manage their own rows, and
    -- guest/demo rows (where user_id IS NULL) remain readable and accessible.
    CREATE POLICY "Projects access policy" ON public.projects
        FOR ALL USING (
            user_id IS NULL OR user_id = auth.uid()
        )
        WITH CHECK (
            user_id IS NULL OR user_id = auth.uid()
        );

    CREATE POLICY "Scratchpad access policy" ON public.scratchpad_notes
        FOR ALL USING (
            user_id IS NULL OR user_id = auth.uid()
        )
        WITH CHECK (
            user_id IS NULL OR user_id = auth.uid()
        );

    CREATE POLICY "Talent access policy" ON public.talent_vault
        FOR ALL USING (
            user_id IS NULL OR user_id = auth.uid()
        )
        WITH CHECK (
            user_id IS NULL OR user_id = auth.uid()
        );

    CREATE POLICY "Snapshots access policy" ON public.project_snapshots
        FOR ALL USING (
            user_id IS NULL OR user_id = auth.uid()
        )
        WITH CHECK (
            user_id IS NULL OR user_id = auth.uid()
        );

    CREATE POLICY "Assets access policy" ON public.assets
        FOR ALL USING (
            user_id IS NULL OR user_id = auth.uid()
        )
        WITH CHECK (
            user_id IS NULL OR user_id = auth.uid()
        );

    CREATE POLICY "Generation cache access policy" ON public.generation_cache
        FOR ALL USING (true)
        WITH CHECK (true);

    -- Storage RLS policies for cinema_assets bucket
    -- NOTE: Because cinema_assets is a PUBLIC bucket, public URLs (CDN downloads)
    -- work automatically without a SELECT policy. Omitting a broad SELECT policy on
    -- storage.objects prevents unauthorized users from listing/scraping directory contents.
    DROP POLICY IF EXISTS "Public view cinema_assets" ON storage.objects;
    DROP POLICY IF EXISTS "Public insert cinema_assets" ON storage.objects;
    DROP POLICY IF EXISTS "Public update cinema_assets" ON storage.objects;
    DROP POLICY IF EXISTS "Public delete cinema_assets" ON storage.objects;

    -- Only allow inserting, updating, and deleting
    CREATE POLICY "Public insert cinema_assets" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'cinema_assets');

    CREATE POLICY "Public update cinema_assets" ON storage.objects
        FOR UPDATE USING (bucket_id = 'cinema_assets');

    CREATE POLICY "Public delete cinema_assets" ON storage.objects
        FOR DELETE USING (bucket_id = 'cinema_assets');
END $$;

