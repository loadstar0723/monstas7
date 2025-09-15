'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { FaBrain } from 'react-icons/fa'

const SignalNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-lg p-4 min-w-[180px] shadow-lg border border-red-500">
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#EF4444' }}
        isConnectable={isConnectable}
      />
      
      <div className="flex items-center gap-2 mb-2">
        <FaBrain className="text-white" />
        <div className="text-white font-semibold">{data.label}</div>
      </div>
      
      <div className="text-xs text-red-100">
        {data.config?.strength && `강도: ${data.config.strength}%`}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        id="signal"
        style={{ background: '#EF4444' }}
        isConnectable={isConnectable}
      />
    </div>
  )
})

SignalNode.displayName = 'SignalNode'

export default SignalNode