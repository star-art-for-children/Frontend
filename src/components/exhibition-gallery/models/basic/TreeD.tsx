import * as THREE from 'three';
import React from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    TwistedTree_5_1: THREE.Mesh;
    TwistedTree_5_2: THREE.Mesh;
  };
  materials: {
    Bark_TwistedTree: THREE.MeshStandardMaterial;
    Leaves_TwistedTree: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

export function TreeD(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF(
    '/GLBformat/basic/treeD.glb'
  ) as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.TwistedTree_5_1.geometry}
        material={materials.Bark_TwistedTree}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.TwistedTree_5_2.geometry}
        material={materials.Leaves_TwistedTree}
      />
    </group>
  );
}

useGLTF.preload('/GLBformat/basic/treeD.glb');
