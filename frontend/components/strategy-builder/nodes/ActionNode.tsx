'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { FaRobot } from 'react-icons/fa'

const ActionNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-lg p-4 min-w-[180px] shadow-lg border border-pink-500">
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#EC4899' }}
        isConnectable={isConnectable}
      />
      
      <div className="flex items-center gap-2 mb-2">
        <FaRobot className="text-white" />
        <div className="text-white font-semibold">{data.label}</div>
      </div>
      
      <div className="text-xs text-pink-100">
        {data.config?.orderType && `유형: ${data.config.orderType}`}
        {data.config?.quantity && ` | 수량: ${data.config.quantity}%`}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        id="status"
        style={{ background: '#EC4899' }}
        isConnectable={isConnectable}
      />
    </div>
  )
})

ActionNode.displayName = 'ActionNode'

export default ActionNode