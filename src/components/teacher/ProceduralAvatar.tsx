"use client";
import { useRef, useEffect, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, useFBX } from '@react-three/drei';
import { useAuthStore } from '@/store/useAuthStore';
import { useAIIntentStore } from '@/store/useAIIntentStore';
import { useAudioLipSync } from '@/hooks/useAudioLipSync';
import { speechSynthesizer } from '@/services/speechSynthesizer';
import { VisemeName } from '@/utils/phonetics';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

interface ProceduralAvatarProps {
  lookAtBoard?: boolean;
  pointAtBoard?: boolean;
}

const ALL_OCULUS_VISEMES: VisemeName[] = [
  'viseme_sil', 'viseme_PP', 'viseme_FF', 'viseme_TH', 'viseme_DD',
  'viseme_kk', 'viseme_CH', 'viseme_SS', 'viseme_nn', 'viseme_RR',
  'viseme_aa', 'viseme_E', 'viseme_I', 'viseme_O', 'viseme_U'
];

// Inner avatar component wrapped in Suspense
function AvatarModel({ lookAtBoard = false, pointAtBoard = false }: ProceduralAvatarProps) {
  const { profile } = useAuthStore();
  const { teacherState } = useAIIntentStore();
  const { getPhonemeWeights } = useAudioLipSync();

  const isMale = profile?.tutorGender === 'male';
  const isSpeaking =
    teacherState === 'speaking' ||
    teacherState === 'teaching' ||
    teacherState === 'correcting' ||
    teacherState === 'celebrating';

  // Authentic Ready Player Me human avatars
  const modelUrl = isMale ? '/models/alex_v2.glb' : '/models/aria_v2.glb';
  const { scene } = useGLTF(modelUrl);

  // Clone scene with proper Skeleton and SkinnedMesh bone bindings
  const clonedScene = useMemo(() => {
    const s = SkeletonUtils.clone(scene);
    s.scale.set(1, 1, 1);
    return s;
  }, [scene, modelUrl]);

  // Bone & Mesh references
  const headRef = useRef<THREE.Object3D | null>(null);
  const neckRef = useRef<THREE.Object3D | null>(null);
  const spineRef = useRef<THREE.Object3D | null>(null);
  const jawRef = useRef<THREE.Object3D | null>(null);
  const headMeshRef = useRef<THREE.SkinnedMesh | null>(null);
  const teethMeshRef = useRef<THREE.SkinnedMesh | null>(null);

  // FBX Animations (ActorCore & Mixamo gesture suite)
  const { animations: idleClips } = useFBX('/animations/Idle.fbx');
  const { animations: explainingClips } = useFBX('/animations/Explaining.fbx');
  const { animations: pointingClips } = useFBX('/animations/Pointing.fbx');
  const { animations: greetingClips } = useFBX('/animations/Greeting.fbx');

  // Clone and name clips immutably for React Compiler safety
  const animationClips = useMemo(() => {
    const list: THREE.AnimationClip[] = [];
    if (idleClips && idleClips[0]) {
      const c = idleClips[0].clone();
      c.name = 'Idle';
      list.push(c);
    }
    if (explainingClips && explainingClips[0]) {
      const c = explainingClips[0].clone();
      c.name = 'Explaining';
      list.push(c);
    }
    if (pointingClips && pointingClips[0]) {
      const c = pointingClips[0].clone();
      c.name = 'Pointing';
      list.push(c);
    }
    if (greetingClips && greetingClips[0]) {
      const c = greetingClips[0].clone();
      c.name = 'Greeting';
      list.push(c);
    }
    return list;
  }, [idleClips, explainingClips, pointingClips, greetingClips]);

  const groupRef = useRef<THREE.Group>(null);
  const { actions } = useAnimations(animationClips, groupRef);
  const currentAnimRef = useRef<string>('Idle');

  // Gesture State Machine: Crossfading between ActorCore animations
  useEffect(() => {
    let targetAnim = 'Idle';
    if (pointAtBoard || teacherState === 'pointing') {
      targetAnim = 'Pointing';
    } else if (teacherState === 'teaching' || teacherState === 'speaking') {
      targetAnim = 'Explaining';
    } else if (teacherState === 'celebrating') {
      targetAnim = 'Greeting';
    }

    const prevAnim = currentAnimRef.current;
    if (actions) {
      const targetAction = actions[targetAnim];
      const prevAction = actions[prevAnim];
      if (targetAction) {
        if (prevAnim !== targetAnim && prevAction) {
          targetAction.reset().play();
          prevAction.crossFadeTo(targetAction, 0.45, true);
        } else if (!targetAction.isRunning()) {
          targetAction.reset().play();
        }
        currentAnimRef.current = targetAnim;
      }
    }
  }, [teacherState, pointAtBoard, actions]);

  // Traverse and bind bones, materials, and morph targets
  useEffect(() => {
    headRef.current = null;
    neckRef.current = null;
    spineRef.current = null;
    jawRef.current = null;
    headMeshRef.current = null;
    teethMeshRef.current = null;

    clonedScene.traverse((child) => {
      const name = child.name;

      if (name === 'Head' || name === 'mixamorigHead') headRef.current = child;
      if (name === 'Neck' || name === 'mixamorigNeck') neckRef.current = child;
      if (name === 'Spine2' || name === 'Spine1') spineRef.current = child;
      if (name === 'Jaw' || name === 'mixamorigJaw') jawRef.current = child;

      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        const mesh = child as THREE.SkinnedMesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // FIX: Disable frustum culling. ReadyPlayerMe / Mixamo rigs often have inaccurate 
        // bounding boxes, causing body parts to disappear when rotated or viewed from angles.
        mesh.frustumCulled = false;

        if (name === 'Wolf3D_Head') {
          headMeshRef.current = mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        } else if (name === 'Wolf3D_Teeth') {
          teethMeshRef.current = mesh;
          mesh.castShadow = false;
        } else if (name === 'Wolf3D_Hair') {
          // Prevent hair bangs from casting dark shadow over eyes & mouth
          mesh.castShadow = false;
          mesh.receiveShadow = false;
        } else if (name === 'Wolf3D_Glasses') {
          // Hide heavy occluding glasses so eyes and expressions are fully visible
          mesh.visible = false;
        } else {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      }
    });
  }, [clonedScene]);

  // Blink state tracking
  const blinkTimerRef = useRef(0);
  const nextBlinkRef = useRef(3.0);
  const isBlinkingRef = useRef(false);

  // Real-time phoneme viseme weights (tracking each of the 15 Oculus visemes)
  const currentVisemeWeights = useRef<Record<string, number>>({});
  const smoothedMouthOpenRef = useRef(0);
  const smoothedBrowUpRef = useRef(0);

  // Frame animation loop: Head tracking, breathing, natural blinking, real-time Web Audio API lip-sync
  useFrame((state, rawDelta) => {
    // CLAMP DELTA: Prevents explosive lerp overshoots (features flying out of face) when switching browser tabs
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;

    // 1. Natural Breathing (Spine & Neck subtle expansion)
    if (spineRef.current) {
      const breath = Math.sin(t * 1.8) * 0.015;
      spineRef.current.rotation.x = THREE.MathUtils.lerp(spineRef.current.rotation.x, breath, delta * 3);
    }

    // 2. Gaze & Head Tracking: Direct, engaged eye contact with student + pointer tracking
    if (headRef.current) {
      let targetYaw = (state.pointer.x * Math.PI) / 12;
      let targetPitch = -(state.pointer.y * Math.PI) / 18;
      let targetRoll = 0;

      if (pointAtBoard || teacherState === 'pointing') {
        // Subtle glance towards the digital board on screen-right while pointing
        targetYaw = -0.26;
        targetPitch = 0.02;
      } else if (teacherState === 'thinking') {
        // Expressive pensive tilt
        targetYaw = 0.12;
        targetPitch = 0.08;
        targetRoll = 0.05;
      }

      // Add gentle organic micro-movements + speech head nod
      const isSpeakingActive = speechSynthesizer.getIsSpeaking() || isSpeaking;
      const speechNod = isSpeakingActive ? Math.sin(t * 7) * 0.025 : 0;
      const microSwayYaw = Math.sin(t * 0.9) * 0.015;
      const microSwayPitch = Math.cos(t * 1.2) * 0.01;

      // Active head orientation: counteract FBX head tilt so educator looks directly into the camera/student's eyes
      const baseFacingYaw = isMale ? 0.0 : -0.75; // Aria's FBX rig head offset
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y || 0,
        baseFacingYaw + (state.pointer.x * Math.PI) / 14 + microSwayYaw,
        delta * 4.5
      ) || 0;
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x || 0,
        0.02 - (state.pointer.y * Math.PI) / 18 + microSwayPitch + speechNod,
        delta * 4.5
      ) || 0;
      headRef.current.rotation.z = THREE.MathUtils.lerp(
        headRef.current.rotation.z || 0,
        targetRoll,
        delta * 4.5
      ) || 0;
    }

    // 3. Natural Eye Blinking via Morph Targets
    blinkTimerRef.current += delta;
    if (blinkTimerRef.current >= nextBlinkRef.current) {
      isBlinkingRef.current = true;
      blinkTimerRef.current = 0;
      nextBlinkRef.current = 2.5 + Math.random() * 3.5; // Next blink in 2.5 - 6.0s
    }

    if (headMeshRef.current && headMeshRef.current.morphTargetDictionary && headMeshRef.current.morphTargetInfluences) {
      const dict = headMeshRef.current.morphTargetDictionary;
      const influences = headMeshRef.current.morphTargetInfluences;

      // Handle blink duration (~150ms)
      const blinkIdx = dict['eyesClosed'] ?? dict['eyeBlinkLeft'];
      if (blinkIdx !== undefined) {
        const targetBlink = blinkTimerRef.current < 0.16 && isBlinkingRef.current ? 1.0 : 0.0;
        influences[blinkIdx] = THREE.MathUtils.lerp(influences[blinkIdx], targetBlink, delta * 25);
        const blinkRightIdx = dict['eyeBlinkRight'];
        if (blinkRightIdx !== undefined) {
          influences[blinkRightIdx] = influences[blinkIdx];
        }
      }

      // 4. Real-time Phonetic Lip-Sync with Full 15 Oculus Visemes
      const activeCue = speechSynthesizer.getCurrentCue();
      const isSynthSpeaking = speechSynthesizer.getIsSpeaking();
      const audioPhonemes = getPhonemeWeights();
      const hasExternalAudio = audioPhonemes.volume > 0.02;

      // Check if currently articulating
      const isArticulating = isSynthSpeaking || hasExternalAudio || isSpeaking;

      // Track each of the 15 Oculus visemes with organic co-articulation lerping
      for (const viseme of ALL_OCULUS_VISEMES) {
        let target = 0;

        if (isSynthSpeaking) {
          if (activeCue.viseme === viseme) {
            target = activeCue.intensity;
          }
        } else if (hasExternalAudio) {
          // Frequency-formant mapping when external audio stream is active
          if (viseme === 'viseme_aa' || viseme === 'viseme_O') {
            target = audioPhonemes.openness;
          } else if (viseme === 'viseme_U') {
            target = audioPhonemes.rounded;
          } else if (viseme === 'viseme_I' || viseme === 'viseme_SS') {
            target = audioPhonemes.consonant;
          }
        } else if (isSpeaking) {
          // Graceful procedural syllable fallback
          const syl = Math.abs(Math.sin(t * 8) * Math.cos(t * 12));
          if (viseme === 'viseme_aa') target = syl * 0.7;
          if (viseme === 'viseme_O') target = Math.abs(Math.sin(t * 5)) * 0.4;
          if (viseme === 'viseme_I') target = Math.abs(Math.cos(t * 7)) * 0.3;
        }

        const current = currentVisemeWeights.current[viseme] || 0;
        const nextVal = THREE.MathUtils.lerp(current, target, delta * 26);
        currentVisemeWeights.current[viseme] = nextVal;

        // Ready Player Me supports viseme_aa or viseme_AA
        const idx = dict[viseme] ?? (viseme === 'viseme_aa' ? dict['viseme_AA'] : undefined);
        if (idx !== undefined) {
          influences[idx] = nextVal;
        }
      }

      // Also drive mouthOpen (especially for Aria and standard VRM morph targets)
      let targetMouthOpen = 0;
      if (isSynthSpeaking) {
        if (activeCue.viseme === 'viseme_aa') targetMouthOpen = activeCue.intensity * 0.85;
        else if (activeCue.viseme === 'viseme_O') targetMouthOpen = activeCue.intensity * 0.55;
        else if (activeCue.viseme === 'viseme_E' || activeCue.viseme === 'viseme_I') targetMouthOpen = activeCue.intensity * 0.35;
        else if (activeCue.viseme === 'viseme_U') targetMouthOpen = activeCue.intensity * 0.40;
        else if (activeCue.viseme === 'viseme_PP' || activeCue.viseme === 'viseme_sil') targetMouthOpen = 0;
        else targetMouthOpen = 0.22;
      } else if (hasExternalAudio) {
        targetMouthOpen = audioPhonemes.openness * 0.9;
      } else if (isSpeaking) {
        targetMouthOpen = Math.abs(Math.sin(t * 8) * Math.cos(t * 12)) * 0.65;
      }

      smoothedMouthOpenRef.current = THREE.MathUtils.lerp(smoothedMouthOpenRef.current, targetMouthOpen, delta * 26);
      const mouthOpenIdx = dict['mouthOpen'];
      if (mouthOpenIdx !== undefined) {
        influences[mouthOpenIdx] = smoothedMouthOpenRef.current;
      }

      // Synchronize teeth mesh morph targets
      if (teethMeshRef.current && teethMeshRef.current.morphTargetDictionary && teethMeshRef.current.morphTargetInfluences) {
        const tDict = teethMeshRef.current.morphTargetDictionary;
        const tInf = teethMeshRef.current.morphTargetInfluences;
        for (const viseme of ALL_OCULUS_VISEMES) {
          const idx = tDict[viseme] ?? (viseme === 'viseme_aa' ? tDict['viseme_AA'] : undefined);
          if (idx !== undefined) {
            tInf[idx] = currentVisemeWeights.current[viseme] || 0;
          }
        }
        const tOpen = tDict['mouthOpen'];
        if (tOpen !== undefined) {
          tInf[tOpen] = smoothedMouthOpenRef.current;
        }
      }

      // Subtle jaw rotation for organic physical opening
      if (jawRef.current) {
        jawRef.current.rotation.x = THREE.MathUtils.lerp(
          jawRef.current.rotation.x,
          smoothedMouthOpenRef.current * 0.08,
          delta * 20
        );
      }

      // Subtle eyebrow animation for expressive engagement
      const browIdx = dict['browInnerUp'];
      if (browIdx !== undefined) {
        const targetBrow = isArticulating && (activeCue.viseme === 'viseme_aa' || teacherState === 'celebrating' || teacherState === 'questioning') ? 0.3 : 0;
        smoothedBrowUpRef.current = THREE.MathUtils.lerp(smoothedBrowUpRef.current, targetBrow, delta * 12);
        influences[browIdx] = smoothedBrowUpRef.current;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Exported component with fallback
export default function ProceduralAvatar(props: ProceduralAvatarProps) {
  return (
    <Suspense fallback={null}>
      <AvatarModel {...props} />
    </Suspense>
  );
}

// Preload assets for instant switching
useGLTF.preload('/models/aria_v2.glb');
useGLTF.preload('/models/alex_v2.glb');
useFBX.preload('/animations/Idle.fbx');
useFBX.preload('/animations/Explaining.fbx');
useFBX.preload('/animations/Pointing.fbx');
useFBX.preload('/animations/Greeting.fbx');
