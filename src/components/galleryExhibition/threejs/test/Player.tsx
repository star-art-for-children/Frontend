import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { WAllType } from '../../../../types/gallery';

export default function Player({
  size = 15,
  speed = 5,
  innerWalls,
}: {
  size?: number;
  speed: number;
  innerWalls: WAllType[];
}) {
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());

  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
  });

  const localPos = useRef(new THREE.Vector3());

  const colliders = useMemo(() => {
    return innerWalls.map((wall) => {
      const pos = new THREE.Vector3(...wall.pos);
      const rot = new THREE.Euler(...(wall.rot ?? [0, 0, 0]));
      const mat = new THREE.Matrix4().compose(
        pos,
        new THREE.Quaternion().setFromEuler(rot),
        new THREE.Vector3(1, 1, 1)
      );
      return {
        inv: mat.clone().invert(),
        halfX: wall.boxSize[0] / 2,
        halfZ: wall.boxSize[2] / 2,
      };
    });
  }, [innerWalls]);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.code
        .replace('Key', '')
        .toLowerCase() as keyof typeof keys.current;

      if (key in keys.current) {
        keys.current[key] = true;
      }
    };

    const up = (e: KeyboardEvent) => {
      const key = e.code
        .replace('Key', '')
        .toLowerCase() as keyof typeof keys.current;

      if (key in keys.current) {
        keys.current[key] = false;
      }
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);

    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);
  useFrame((state, delta) => {
    direction.current.set(0, 0, 0);

    if (keys.current.w) direction.current.z -= 1;
    if (keys.current.s) direction.current.z += 1;
    if (keys.current.a) direction.current.x -= 1;
    if (keys.current.d) direction.current.x += 1;

    velocity.current.x = direction.current.x * speed * delta;
    velocity.current.z = direction.current.z * speed * delta;

    const camera = state.camera;

    camera.getWorldDirection(forward.current);
    forward.current.y = 0;

    if (forward.current.lengthSq() < 1e-6) {
      forward.current.set(0, 0, -1);
    } else {
      forward.current.normalize();
    }

    right.current.crossVectors(forward.current, camera.up).normalize();

    const newX =
      camera.position.x +
      right.current.x * velocity.current.x -
      forward.current.x * velocity.current.z;

    const newZ =
      camera.position.z +
      right.current.z * velocity.current.x -
      forward.current.z * velocity.current.z;

    const newPos = new THREE.Vector3(newX, size / 30, newZ);

    let blocked = false;

    const pad = 0.3;

    for (const collider of colliders) {
      const temp = localPos.current.copy(newPos).applyMatrix4(collider.inv);

      const inside =
        Math.abs(temp.x) < collider.halfX + pad &&
        Math.abs(temp.z) < collider.halfZ + pad;

      if (inside) {
        blocked = true;
        break;
      }
    }

    if (!blocked) {
      camera.position.copy(newPos);
    }
  });
  return <>{/*<pointLight position={[0,2,0]} intensity={10} />*/}</>;
}
