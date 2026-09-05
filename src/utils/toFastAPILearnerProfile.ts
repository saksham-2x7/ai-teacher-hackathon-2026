import { LearnerProfile as AuthLearnerProfile } from '../store/useAuthStore';

export interface FastAPILearnerProfile {
  learner_id: string;
  name: string;
  topic: string;
  depth_level: number;
  learning_style: 'visual' | 'kinesthetic' | 'auditory' | 'reading';
  tutor_gender: 'female' | 'male';
  scaffold_level: number;
  preferences: {
    language: string;
    daily_goal_minutes: number;
    level: string;
    streak_days: number;
  };
}

/**
 * Transformer to serialize frontend onboarding profile state
 * into the exact FastAPI JSON schema required by backend /api/v1/sessions
 */
export function toFastAPILearnerProfile(
  profile: Partial<AuthLearnerProfile> | null,
  topicGoal: string = 'Neural Networks'
): FastAPILearnerProfile {
  const levelToDepth: Record<string, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3
  };

  const level = profile?.level || 'beginner';
  const depthLevel = levelToDepth[level] || 1;

  return {
    learner_id: profile?.email ? btoa(profile.email).replace(/=/g, '').slice(0, 16) : `user_${Date.now()}`,
    name: profile?.name || 'Learner',
    topic: topicGoal || 'Neural Networks',
    depth_level: depthLevel,
    learning_style: 'visual',
    tutor_gender: profile?.tutorGender === 'male' ? 'male' : 'female',
    scaffold_level: 3, // High scaffolding default for new concepts
    preferences: {
      language: profile?.language || 'en',
      daily_goal_minutes: profile?.dailyGoalMinutes || 30,
      level: level,
      streak_days: profile?.streakDays || 1
    }
  };
}
