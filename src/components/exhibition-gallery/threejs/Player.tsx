import { WAllType } from '@/types/gallery';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

type CircleCollider = { x: number; z: number; radius: number };

export default function Player({
  speed = 5,
  innerWalls,
  startPos,
  startLookAt,
  circleCollidersRef,
  sendMove,
}: {
  size?: number;
  speed: number;
  innerWalls: WAllType[];
  startPos: { x: number; y: number; z: number };
  startLookAt?: { x: number; y: number; z: number };
  circleCollidersRef?: React.RefObject<CircleCollider[]>;
  sendMove?: (camera: THREE.Camera) => void;
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
  const prevPos = useRef(new THREE.Vector3(Infinity, Infinity, Infinity));
  const prevYaw = useRef(Infinity);

  const initialized = useRef(false);

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
    const camera = state.camera;

    if (!initialized.current && startPos) {
      camera.position.set(startPos.x, startPos.y, startPos.z);
      if (startLookAt) {
        camera.lookAt(startLookAt.x, startLookAt.y, startLookAt.z);
      }
      initialized.current = true;
    }

    if (!document.pointerLockElement) return;

    direction.current.set(0, 0, 0);

    if (keys.current.w) direction.current.z -= 1;
    if (keys.current.s) direction.current.z += 1;
    if (keys.current.a) direction.current.x -= 1;
    if (keys.current.d) direction.current.x += 1;

    velocity.current.x = direction.current.x * speed * delta;
    velocity.current.z = direction.current.z * speed * delta;

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

    const newPos = new THREE.Vector3(newX, startPos.y, newZ);

    let blocked = false;
    const pad = 0.3;

    for (const collider of colliders) {
      const temp = localPos.current.copy(newPos).applyMatrix4(collider.inv);
      if (
        Math.abs(temp.x) < collider.halfX + pad &&
        Math.abs(temp.z) < collider.halfZ + pad
      ) {
        blocked = true;
        break;
      }
    }

    if (!blocked && circleCollidersRef?.current) {
      for (const cc of circleCollidersRef.current) {
        const dx = newPos.x - cc.x;
        const dz = newPos.z - cc.z;
        if (dx * dx + dz * dz < cc.radius * cc.radius) {
          blocked = true;
          break;
        }
      }
    }

    if (!blocked) {
      camera.position.copy(newPos);
    }

    if (sendMove) {
      forward.current.set(0, 0, -1).applyQuaternion(camera.quaternion);
      forward.current.y = 0;
      forward.current.normalize();
      const yaw = Math.atan2(forward.current.x, forward.current.z);

      const posMoved =
        camera.position.distanceToSquared(prevPos.current) > 0.0001;
      const yawChanged = Math.abs(yaw - prevYaw.current) > 0.01;

      if (posMoved || yawChanged) {
        prevPos.current.copy(camera.position);
        prevYaw.current = yaw;
        sendMove(camera);
      }
    }
  });

  return null;
}
