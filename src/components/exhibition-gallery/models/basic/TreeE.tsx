import * as THREE from 'three';
import React from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    ['Node-Mesh']: THREE.Mesh;
    ['Node-Mesh_1']: THREE.Mesh;
  };
  materials: {
    mat20: THREE.MeshStandardMaterial;
    mat13: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

export function TreeE(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF(
    '/GLBformat/basic/treeE.glb'
  ) as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Node-Mesh'].geometry}
        material={materials.mat20}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Node-Mesh_1'].geometry}
        material={materials.mat13}
      />
    </group>
  );
}

useGLTF.preload('/GLBformat/basic/treeE.glb');
