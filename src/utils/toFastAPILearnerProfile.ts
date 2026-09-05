import { LearnerProfile as AuthLearnerProfile } from '../store/useAuthStore';

export interface BackendLearnerProfile {
  student_id: string | null;
  educational_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  target_subject: string;
  available_time_minutes: number;
  preferred_language: string;
  learning_style: 'CONCEPTUAL' | 'PRACTICAL' | 'ANALYTICAL';
}

export interface CreateSessionPayload {
  learner_profile: BackendLearnerProfile;
  current_topic: string;
  material_id?: string | null;
}

const LEVEL_TO_EDUCATIONAL: Record<string, 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'> = {
  beginner: 'BEGINNER',
  intermediate: 'INTERMEDIATE',
  advanced: 'ADVANCED'
};

/**
 * Serializes the frontend onboarding profile into the exact JSON body the
 * backend expects for POST /api/v1/sessions:
 *   { learner_profile: LearnerProfile, current_topic, material_id? }
 */
export function toFastAPILearnerProfile(
  profile: Partial<AuthLearnerProfile> | null,
  topicGoal: string = 'Photosynthesis'
): CreateSessionPayload {
  const level = profile?.level || 'beginner';

  return {
    learner_profile: {
      student_id: profile?.email ? btoa(profile.email).replace(/=/g, '').slice(0, 16) : null,
      educational_level: LEVEL_TO_EDUCATIONAL[level] || 'BEGINNER',
      target_subject: topicGoal,
      available_time_minutes: profile?.dailyGoalMinutes || 30,
      preferred_language: profile?.language || 'en',
      learning_style: 'CONCEPTUAL'
    },
    current_topic: topicGoal
  };
}