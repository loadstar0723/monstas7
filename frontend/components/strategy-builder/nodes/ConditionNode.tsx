'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { FaCog } from 'react-icons/fa'

const ConditionNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg p-4 min-w-[180px] shadow-lg border border-amber-500">
      <Handle
        type="target"
        position={Position.Left}
        id="value1"
        style={{ background: '#F59E0B', top: '30%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="value2"
        style={{ background: '#F59E0B', top: '70%' }}
        isConnectable={isConnectable}
      />
      
      <div className="flex items-center gap-2 mb-2">
        <FaCog className="text-white" />
        <div className="text-white font-semibold">{data.label}</div>
      </div>
      
      <div className="text-xs text-amber-100">
        {data.config?.operator || 'AND'}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        id="result"
        style={{ background: '#F59E0B' }}
        isConnectable={isConnectable}
      />
    </div>
  )
})

ConditionNode.displayName = 'ConditionNode'

export default ConditionNode