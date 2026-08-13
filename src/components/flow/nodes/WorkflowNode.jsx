"use client";

import BaseNode from "./BaseNode";

/** Single React Flow node type — all catalog nodes render through BaseNode. */
export default function WorkflowNode({ id, data, selected }) {
  const isStart = data?.nodeType === "start";

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      showTarget={!isStart}
      showSource
    />
  );
}
