import type { ThreeElements } from '@react-three/fiber';
import type * as THREE from 'three';

declare global {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends ThreeElements {}
  }
  type GLTFAction = THREE.AnimationClip;
}

export {};
