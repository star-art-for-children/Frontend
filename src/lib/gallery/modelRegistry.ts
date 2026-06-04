import React from 'react';
import { BenchA } from '@/components/exhibition-gallery/models/basic/BenchA';
import { CoralA } from '@/components/exhibition-gallery/models/basic/CoralA';
import { CoralB } from '@/components/exhibition-gallery/models/basic/CoralB';
import { CoralC } from '@/components/exhibition-gallery/models/basic/CoralC';
import { CrystalA } from '@/components/exhibition-gallery/models/basic/CrystalA';
import { FishA } from '@/components/exhibition-gallery/models/basic/FishA';
import { FishB } from '@/components/exhibition-gallery/models/basic/FishB';
import { FlowerA } from '@/components/exhibition-gallery/models/basic/FlowerA';
import { FlowerB } from '@/components/exhibition-gallery/models/basic/FlowerB';
import { FlowerC } from '@/components/exhibition-gallery/models/basic/FlowerC';
import { RockA } from '@/components/exhibition-gallery/models/basic/RockA';
import { RockB } from '@/components/exhibition-gallery/models/basic/RockB';
import { RocketA } from '@/components/exhibition-gallery/models/basic/RocketA';
import { RocketB } from '@/components/exhibition-gallery/models/basic/RocketB';
import { StarA } from '@/components/exhibition-gallery/models/basic/StarA';
import { TreeA } from '@/components/exhibition-gallery/models/basic/TreeA';
import { TreeB } from '@/components/exhibition-gallery/models/basic/TreeB';
import { TreeC } from '@/components/exhibition-gallery/models/basic/TreeC';
import { PresentACube } from '@/components/exhibition-gallery/models/basic/PresentACube';
import { PresentARound } from '@/components/exhibition-gallery/models/basic/PresentARound';
import { PresentBCube } from '@/components/exhibition-gallery/models/basic/PresentBCube';
import { PresentBRound } from '@/components/exhibition-gallery/models/basic/PresentBRound';
import { SnowPile } from '@/components/exhibition-gallery/models/basic/SnowPile';
import { TreeDecoratedSnow } from '@/components/exhibition-gallery/models/basic/TreeDecoratedSnow';
import { WreathDecorated } from '@/components/exhibition-gallery/models/basic/WreathDecorated';
import { FlowerTreeA } from '@/components/exhibition-gallery/models/basic/FlowerTreeA';
import { FlowerTreeB } from '@/components/exhibition-gallery/models/basic/FlowerTreeB';
import { CherryBlossomTree } from '@/components/exhibition-gallery/models/basic/CherryBlossomTree';
import { Turtle } from '@/components/exhibition-gallery/models/basic/Turtle';
import { Dolphin } from '@/components/exhibition-gallery/models/basic/Dolphin';
import { Starfish } from '@/components/exhibition-gallery/models/basic/Starfish';

export type ModelEntry = {
  component: React.ComponentType<JSX.IntrinsicElements['group']>;
  /** 모든 모델을 동일 기준 크기(약 1m)로 맞추는 정규화 스케일. AI scale은 이 값의 배율로 적용됨 */
  baseScale: number;
  /** 피벗 보정값 — 모델이 바닥에 박히거나 떠있을 때 조정 */
  yOffset: number;
  /** 원형 충돌 반경 (scale=1 기준). 미설정 시 충돌 없음 */
  colliderRadius?: number;
};

export const MODEL_REGISTRY: Record<string, ModelEntry> = {
  BenchA: { component: BenchA, baseScale: 3.0, yOffset: 0.25 },
  CoralA: { component: CoralA, baseScale: 1.0, yOffset: 1 },
  CoralB: { component: CoralB, baseScale: 1.0, yOffset: 1 },
  CoralC: { component: CoralC, baseScale: 1.0, yOffset: 0 },
  CrystalA: { component: CrystalA, baseScale: 0.2, yOffset: 0 },
  FishA: { component: FishA, baseScale: 0.02, yOffset: 0 },
  FishB: { component: FishB, baseScale: 0.4, yOffset: 0 },
  FlowerA: { component: FlowerA, baseScale: 0.1, yOffset: 0 },
  FlowerB: { component: FlowerB, baseScale: 1.0, yOffset: 0.6 },
  FlowerC: { component: FlowerC, baseScale: 0.3, yOffset: 1 },
  RockA: { component: RockA, baseScale: 1.0, yOffset: 0 },
  RockB: { component: RockB, baseScale: 3.0, yOffset: 0 },
  RocketA: { component: RocketA, baseScale: 0.5, yOffset: 30 },
  RocketB: { component: RocketB, baseScale: 6, yOffset: 2 },
  StarA: { component: StarA, baseScale: 0.5, yOffset: 0 },
  TreeA: { component: TreeA, baseScale: 0.05, yOffset: 0, colliderRadius: 1 },
  TreeB: {
    component: TreeB,
    baseScale: 5.0,
    yOffset: 1.7,
    colliderRadius: 0.8,
  },
  TreeC: {
    component: TreeC,
    baseScale: 5.0,
    yOffset: 1.1,
    colliderRadius: 0.8,
  },
  PresentACube: { component: PresentACube, baseScale: 2.0, yOffset: 0 },
  PresentARound: { component: PresentARound, baseScale: 2.0, yOffset: 0 },
  PresentBCube: { component: PresentBCube, baseScale: 2.0, yOffset: 0 },
  PresentBRound: { component: PresentBRound, baseScale: 2.0, yOffset: 0 },
  SnowPile: { component: SnowPile, baseScale: 1.0, yOffset: 0 },
  TreeDecoratedSnow: {
    component: TreeDecoratedSnow,
    baseScale: 3.0,
    yOffset: 0,
    colliderRadius: 0.6,
  },
  WreathDecorated: { component: WreathDecorated, baseScale: 1.0, yOffset: 0 },
  FlowerTreeA: {
    component: FlowerTreeA,
    baseScale: 0.9,
    yOffset: 0,
    colliderRadius: 0.9,
  },
  FlowerTreeB: {
    component: FlowerTreeB,
    baseScale: 0.1,
    yOffset: 0,
    colliderRadius: 0.9,
  },
  CherryBlossomTree: {
    component: CherryBlossomTree,
    baseScale: 20.0,
    yOffset: 0,
    colliderRadius: 0.8,
  },
  Turtle: { component: Turtle, baseScale: 0.4, yOffset: 20 },
  Dolphin: { component: Dolphin, baseScale: 0.3, yOffset: 50 },
  Starfish: { component: Starfish, baseScale: 0.5, yOffset: 0 },
};
