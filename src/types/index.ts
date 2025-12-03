export interface Card {
  id: string
  title: string
  description: string | null
  type: string | null
  difficulty: 'easy' | 'medium' | 'hard' | null
  priority: 'low' | 'medium' | 'high' | null
  time_estimation: number | null // in minutes
  image_url: string | null
  deck_id: string | null
  created_at: string
  updated_at: string
  user_id: string
}

export interface CardRelationship {
  id: string
  card_id: string
  related_card_id: string
  relationship_type: 'blocks' | 'related' | 'depends_on'
  created_at: string
}

export interface Deck {
  id: string
  name: string
  description: string | null
  is_special: boolean
  created_at: string
  updated_at: string
  user_id: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  user_id: string
}

export interface ProjectDeck {
  id: string
  project_id: string
  deck_id: string
  created_at: string
}

export interface Playtime {
  id: string
  type: 'opening' | 'hard_work' | 'work' | 'after_work'
  started_at: string
  ended_at: string | null
  user_id: string
  created_at: string
}

export interface PlaytimeCard {
  id: string
  playtime_id: string
  card_id: string
  deck_id: string
  created_at: string
}

export interface CardSession {
  id: string
  card_id: string
  playtime_id: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  user_id: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon_url: string | null
  criteria: Record<string, any>
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
}

export interface UserStats {
  id: string
  user_id: string
  total_projects: number
  total_cards: number
  total_time_played: number // in seconds
  hardest_card_id: string | null
  updated_at: string
}

