-- ── Tabela de perfis ────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  nome TEXT,
  email TEXT UNIQUE,
  plano TEXT DEFAULT 'gratuito', -- gratuito | pro | empresa
  cvs_criados INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tabela de CVs ───────────────────────────────────────────────────────────
CREATE TABLE cvs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  template TEXT DEFAULT 'classico',
  data JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  slug TEXT UNIQUE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tabela de uso de IA (para rate limiting) ───────────────────────────────
CREATE TABLE ai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  tipo TEXT, -- resumo | experiencia | competencias | carta
  tokens_usados INTEGER,
  provider TEXT DEFAULT 'gemini', -- gemini | groq
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS Policies ────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "cvs_own" ON cvs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cvs_public" ON cvs FOR SELECT USING (is_public = TRUE);
CREATE POLICY "ai_usage_own" ON ai_usage FOR ALL USING (auth.uid() = user_id);

-- ── Trigger: auto-criar perfil após registo ────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, nome)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email,'@',1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
