"use client";

import { BaseEdge, getSmoothStepPath } from "reactflow";
import styles from "../styles/edge.module.css";

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
}) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      className={`${styles.edgePath} ${selected ? styles.edgePathSelected : ""}`}
    />
  );
}
