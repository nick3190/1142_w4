"use client";

import { Visualizer } from "./Visualizer";

type ParticleRingProps = Omit<React.ComponentProps<typeof Visualizer>, "mode">;

/** 舊名稱保留：等同 <Visualizer mode="ring" /> */
export function ParticleRing(props: ParticleRingProps) {
  return <Visualizer mode="ring" {...props} />;
}
