import { WAllType } from '@/types/gallery';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const HEAD_HEIGHT = 1.2;
const MOUSE_SENSITIVITY = 0.003;
const MIN_PITCH = 0.05;
const MAX_PITCH = Math.PI / 2 - 0.05;
const MIN_DIST = 1.0;
const MAX_DIST = 8.0;

type CircleCollider = { x: number; z: number; radius: number };

export default function Player({
  speed = 5,
  innerWalls,
  startPos,
  startLookAt,
  circleCollidersRef,
  sendMove,
  isThirdPerson,
  onToggleThirdPerson,
  playerPosRef,
  playerYawRef,
}: {
  size?: number;
  speed: number;
  innerWalls: WAllType[];
  startPos: { x: number; y: number; z: number };
  startLookAt?: { x: number; y: number; z: number };
  circleCollidersRef?: React.RefObject<CircleCollider[]>;
  sendMove?: (camera: THREE.Camera) => void;
  isThirdPerson: boolean;
  onToggleThirdPerson: () => void;
  playerPosRef: React.RefObject<THREE.Vector3>;
  playerYawRef: React.RefObject<number>;
}) {
  const direction = useRef(new THREE.Vector3());
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const velocity = useRef(new THREE.Vector3());
  const newPosTemp = useRef(new THREE.Vector3());

  const keys = useRef({ w: false, a: false, s: false, d: false });
  const localPos = useRef(new THREE.Vector3());
  const prevPos = useRef(new THREE.Vector3(Infinity, Infinity, Infinity));
  const prevYaw = useRef(Infinity);
  const initialized = useRef(false);
  const wasThirdPerson = useRef(false);

  const orbitYaw = useRef(0);
  const orbitPitch = useRef(0.4);
  const orbitDist = useRef(2.5);

  // sendMove용 프록시 (3인칭에서 플레이어 위치로 전송)
  const sendProxy = useRef({
    position: new THREE.Vector3(),
    getWorldDirection: (v: THREE.Vector3) =>
      v.set(Math.sin(playerYawRef.current), 0, Math.cos(playerYawRef.current)),
    quaternion: new THREE.Quaternion(),
  });

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

  const checkCollision = (x: number, z: number): boolean => {
    newPosTemp.current.set(x, startPos.y, z);
    const pad = 0.3;
    for (const collider of colliders) {
      const temp = localPos.current
        .copy(newPosTemp.current)
        .applyMatrix4(collider.inv);
      if (
        Math.abs(temp.x) < collider.halfX + pad &&
        Math.abs(temp.z) < collider.halfZ + pad
      )
        return true;
    }
    if (circleCollidersRef?.current) {
      for (const cc of circleCollidersRef.current) {
        const dx = x - cc.x;
        const dz = z - cc.z;
        if (dx * dx + dz * dz < cc.radius * cc.radius) return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '4') {
        onToggleThirdPerson();
        return;
      }
      if (e.key === '5') {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `gallery-${Date.now()}.png`;
        link.click();
        return;
      }
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
      const key = e.code
        .replace('Key', '')
        .toLowerCase() as keyof typeof keys.current;
      if (key in keys.current) keys.current[key] = true;
    };
    const up = (e: KeyboardEvent) => {
      const key = e.code
        .replace('Key', '')
        .toLowerCase() as keyof typeof keys.current;
      if (key in keys.current) keys.current[key] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [onToggleThirdPerson]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isThirdPerson || !document.pointerLockElement) return;
      orbitYaw.current -= e.movementX * MOUSE_SENSITIVITY;
      orbitPitch.current = Math.max(
        MIN_PITCH,
        Math.min(
          MAX_PITCH,
          orbitPitch.current + e.movementY * MOUSE_SENSITIVITY
        )
      );
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isThirdPerson]);

  useEffect(() => {
    if (!isThirdPerson) return;
    const canvas = document.querySelector('canvas');
    const handleClick = () => {
      if (!document.pointerLockElement) canvas?.requestPointerLock();
    };
    canvas?.addEventListener('click', handleClick);
    return () => canvas?.removeEventListener('click', handleClick);
  }, [isThirdPerson]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isThirdPerson) return;
      orbitDist.current = Math.max(
        MIN_DIST,
        Math.min(MAX_DIST, orbitDist.current + e.deltaY * 0.01)
      );
    };
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isThirdPerson]);

  useFrame((state, delta) => {
    const camera = state.camera;

    // 1. 초기화
    if (!initialized.current && startPos) {
      camera.position.set(startPos.x, startPos.y, startPos.z);
      if (startLookAt)
        camera.lookAt(startLookAt.x, startLookAt.y, startLookAt.z);
      playerPosRef.current.set(startPos.x, startPos.y, startPos.z);
      initialized.current = true;
    }

    // 2. 모드 전환
    const justEntered = isThirdPerson && !wasThirdPerson.current;
    const justLeft = !isThirdPerson && wasThirdPerson.current;
    wasThirdPerson.current = isThirdPerson;

    if (justEntered) {
      playerPosRef.current.set(
        camera.position.x,
        startPos.y,
        camera.position.z
      );
      orbitYaw.current = playerYawRef.current + Math.PI;
      orbitPitch.current = 0.4;
    }
    if (justLeft) {
      camera.position.set(
        playerPosRef.current.x,
        startPos.y,
        playerPosRef.current.z
      );
      const yaw = playerYawRef.current;
      camera.lookAt(
        playerPosRef.current.x + Math.sin(yaw),
        startPos.y,
        playerPosRef.current.z + Math.cos(yaw)
      );
    }

    // 3. 입력 포커스 중이면 이동 스킵
    const activeTag = (document.activeElement as HTMLElement)?.tagName;
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

    // 4. 1인칭은 포인터락 필요
    if (!isThirdPerson && !document.pointerLockElement) return;

    // 5. WASD 방향 (공통)
    direction.current.set(0, 0, 0);
    if (keys.current.w) direction.current.z -= 1;
    if (keys.current.s) direction.current.z += 1;
    if (keys.current.a) direction.current.x -= 1;
    if (keys.current.d) direction.current.x += 1;

    // 6. 모드별 이동 + 카메라
    if (isThirdPerson) {
      if (direction.current.lengthSq() > 0) {
        const camFwdX = -Math.sin(orbitYaw.current);
        const camFwdZ = -Math.cos(orbitYaw.current);
        const camRightX = Math.cos(orbitYaw.current);
        const camRightZ = -Math.sin(orbitYaw.current);
        const moveX =
          (camFwdX * -direction.current.z + camRightX * direction.current.x) *
          speed *
          delta;
        const moveZ =
          (camFwdZ * -direction.current.z + camRightZ * direction.current.x) *
          speed *
          delta;
        const newX = playerPosRef.current.x + moveX;
        const newZ = playerPosRef.current.z + moveZ;
        if (!checkCollision(newX, newZ)) {
          playerPosRef.current.x = newX;
          playerPosRef.current.z = newZ;
          playerYawRef.current = Math.atan2(moveX, moveZ);
        }
      }
      const cosPitch = Math.cos(orbitPitch.current);
      const sinPitch = Math.sin(orbitPitch.current);
      camera.position.set(
        playerPosRef.current.x +
          orbitDist.current * cosPitch * Math.sin(orbitYaw.current),
        startPos.y + HEAD_HEIGHT + orbitDist.current * sinPitch,
        playerPosRef.current.z +
          orbitDist.current * cosPitch * Math.cos(orbitYaw.current)
      );
      camera.lookAt(
        playerPosRef.current.x,
        startPos.y + HEAD_HEIGHT,
        playerPosRef.current.z
      );
    } else {
      velocity.current.x = direction.current.x * speed * delta;
      velocity.current.z = direction.current.z * speed * delta;
      camera.getWorldDirection(forward.current);
      forward.current.y = 0;
      if (forward.current.lengthSq() < 1e-6) forward.current.set(0, 0, -1);
      else forward.current.normalize();
      right.current.crossVectors(forward.current, camera.up).normalize();
      const newX =
        camera.position.x +
        right.current.x * velocity.current.x -
        forward.current.x * velocity.current.z;
      const newZ =
        camera.position.z +
        right.current.z * velocity.current.x -
        forward.current.z * velocity.current.z;
      if (!checkCollision(newX, newZ))
        camera.position.set(newX, startPos.y, newZ);
      playerPosRef.current.set(
        camera.position.x,
        startPos.y,
        camera.position.z
      );
      forward.current.set(0, 0, -1).applyQuaternion(camera.quaternion);
      forward.current.y = 0;
      forward.current.normalize();
      playerYawRef.current = Math.atan2(forward.current.x, forward.current.z);
    }

    // 7. sendMove (공통)
    if (sendMove) {
      const yaw = playerYawRef.current;
      const pos = playerPosRef.current;
      const posMoved = pos.distanceToSquared(prevPos.current) > 0.0001;
      const yawChanged = Math.abs(yaw - prevYaw.current) > 0.01;
      if (posMoved || yawChanged) {
        prevPos.current.copy(pos);
        prevYaw.current = yaw;
        if (isThirdPerson) {
          sendProxy.current.position.set(pos.x, startPos.y, pos.z);
          sendMove(sendProxy.current as unknown as THREE.Camera);
        } else {
          sendMove(camera);
        }
      }
    }
  });

  return null;
}
