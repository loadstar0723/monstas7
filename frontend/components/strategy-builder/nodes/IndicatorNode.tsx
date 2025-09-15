'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { FaChartLine } from 'react-icons/fa'

const IndicatorNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-4 min-w-[180px] shadow-lg border border-green-500">
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#10B981' }}
        isConnectable={isConnectable}
      />
      
      <div className="flex items-center gap-2 mb-2">
        <FaChartLine className="text-white" />
        <div className="text-white font-semibold">{data.label}</div>
      </div>
      
      <div className="text-xs text-green-100">
        {data.config?.period && `기간: ${data.config.period}`}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        id="value"
        style={{ background: '#10B981', top: '30%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="signal"
        style={{ background: '#10B981', top: '70%' }}
        isConnectable={isConnectable}
      />
    </div>
  )
})

IndicatorNode.displayName = 'IndicatorNode'

export default IndicatorNode