"use client";

import BaseNode from "./BaseNode";
import { getWorkflowNode } from "../config/workflowNodes";

/** Single React Flow node type — all catalog nodes render through BaseNode. */
export default function WorkflowNode({ id, data, selected }) {
  const isStart = data?.nodeType === "start";
  const isEnd = data?.nodeType === "end";
  const def = getWorkflowNode(data?.nodeType);
  const isTrigger = Boolean(
    def?.isTrigger || data?.isTrigger || data?.triggerKey
  );

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      showTarget={!isStart && !isTrigger}
      showSource={!isEnd}
    />
  );
}
