-- Row Level Security (RLS) Policies
-- Run this after running 001_initial_schema.sql

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE playtimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE playtime_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_decks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROJECTS POLICIES
-- ============================================
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- DECKS POLICIES
-- ============================================
CREATE POLICY "Users can view own decks" ON decks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decks" ON decks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decks" ON decks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decks" ON decks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- CARDS POLICIES
-- ============================================
CREATE POLICY "Users can view own cards" ON cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" ON cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards" ON cards
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- CARD RELATIONSHIPS POLICIES
-- ============================================
-- Users can view relationships for their own cards
CREATE POLICY "Users can view own card relationships" ON card_relationships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cards 
      WHERE cards.id = card_relationships.card_id 
      AND cards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own card relationships" ON card_relationships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cards 
      WHERE cards.id = card_relationships.card_id 
      AND cards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own card relationships" ON card_relationships
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM cards 
      WHERE cards.id = card_relationships.card_id 
      AND cards.user_id = auth.uid()
    )
  );

-- ============================================
-- PLAYTIMES POLICIES
-- ============================================
CREATE POLICY "Users can view own playtimes" ON playtimes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own playtimes" ON playtimes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playtimes" ON playtimes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playtimes" ON playtimes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PLAYTIME CARDS POLICIES
-- ============================================
CREATE POLICY "Users can view own playtime cards" ON playtime_cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playtimes 
      WHERE playtimes.id = playtime_cards.playtime_id 
      AND playtimes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own playtime cards" ON playtime_cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM playtimes 
      WHERE playtimes.id = playtime_cards.playtime_id 
      AND playtimes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own playtime cards" ON playtime_cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM playtimes 
      WHERE playtimes.id = playtime_cards.playtime_id 
      AND playtimes.user_id = auth.uid()
    )
  );

-- ============================================
-- CARD SESSIONS POLICIES
-- ============================================
CREATE POLICY "Users can view own card sessions" ON card_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own card sessions" ON card_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own card sessions" ON card_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own card sessions" ON card_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- USER ACHIEVEMENTS POLICIES
-- ============================================
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- USER STATS POLICIES
-- ============================================
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- PROJECT DECKS POLICIES (Many-to-Many)
-- ============================================
-- Users can view project_decks for their own projects or decks
CREATE POLICY "Users can view own project decks" ON project_decks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_decks.project_id 
      AND projects.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM decks 
      WHERE decks.id = project_decks.deck_id 
      AND decks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own project decks" ON project_decks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_decks.project_id 
      AND projects.user_id = auth.uid()
    ) AND EXISTS (
      SELECT 1 FROM decks 
      WHERE decks.id = project_decks.deck_id 
      AND decks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project decks" ON project_decks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_decks.project_id 
      AND projects.user_id = auth.uid()
    )
  );

