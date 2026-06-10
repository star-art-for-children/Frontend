import React, { useRef, useMemo, useEffect } from 'react';
import { useGraph, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils, GLTF } from 'three-stdlib';
import * as THREE from 'three';

const CHICKEN_PATH = '/GLBformat/character/humanCharactor.glb';
const Y_OFFSET = 0;
const FADE_DURATION = 0.2;

type ActionName = 'Running' | 'Walking';

type HumanGLTFResult = GLTF & {
  nodes: { char1: THREE.SkinnedMesh; Hips: THREE.Bone };
  materials: { Material_1: THREE.MeshStandardMaterial };
  animations: THREE.AnimationClip[];
};

export default function HumanCharacter() {
  const groupRef = useRef<THREE.Group>(null);
  const actionsRef = useRef<Partial<Record<ActionName, THREE.AnimationAction>>>(
    {}
  );
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);

  const { scene, animations } = useGLTF(CHICKEN_PATH);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone) as unknown as HumanGLTFResult;
  const { actions } = useAnimations(animations, groupRef);

  const prevPos = useRef(new THREE.Vector3());
  const tempPos = useRef(new THREE.Vector3());

  useEffect(() => {
    (['Walking', 'Running'] as ActionName[]).forEach((name) => {
      const action = actions[name];
      if (action) actionsRef.current[name] = action;
    });

    const walkAction = actionsRef.current['Walking'];
    if (walkAction) {
      walkAction.play();
      walkAction.paused = true;
      currentActionRef.current = walkAction;
    }
  }, [actions]);

  useFrame(() => {
    if (!groupRef.current) return;

    groupRef.current.getWorldPosition(tempPos.current);
    const posMoved = tempPos.current.distanceTo(prevPos.current) > 0.002;

    const switchTo = (name: ActionName) => {
      const next = actionsRef.current[name];
      const current = currentActionRef.current;
      if (!next) return;
      if (next === current) {
        next.paused = false;
        return;
      }
      current?.fadeOut(FADE_DURATION);
      next.reset().fadeIn(FADE_DURATION).play();
      currentActionRef.current = next;
    };

    if (posMoved) {
      switchTo('Walking');
    } else {
      if (currentActionRef.current) currentActionRef.current.paused = true;
    }

    prevPos.current.copy(tempPos.current);
  });

  return (
    <group ref={groupRef} dispose={null}>
      <group name="Armature" scale={0.01} position={[0, Y_OFFSET, 0]}>
        <primitive object={nodes.Hips} />
        <skinnedMesh
          geometry={nodes.char1.geometry}
          material={materials.Material_1}
          skeleton={nodes.char1.skeleton}
        />
      </group>
    </group>
  );
}

useGLTF.preload(CHICKEN_PATH);
