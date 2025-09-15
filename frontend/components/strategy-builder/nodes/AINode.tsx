'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { GiArtificialIntelligence } from 'react-icons/gi'

const AINode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-4 min-w-[180px] shadow-lg border border-purple-500">
      <Handle
        type="target"
        position={Position.Left}
        id="data"
        style={{ background: '#8B5CF6', top: '30%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="features"
        style={{ background: '#8B5CF6', top: '70%' }}
        isConnectable={isConnectable}
      />
      
      <div className="flex items-center gap-2 mb-2">
        <GiArtificialIntelligence className="text-white" />
        <div className="text-white font-semibold">{data.label}</div>
      </div>
      
      <div className="text-xs text-purple-100">
        {data.config?.model && `모델: ${data.config.model}`}
        {data.config?.confidence && ` | 신뢰도: ${data.config.confidence}%`}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        id="prediction"
        style={{ background: '#8B5CF6', top: '30%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="confidence"
        style={{ background: '#8B5CF6', top: '70%' }}
        isConnectable={isConnectable}
      />
    </div>
  )
})

AINode.displayName = 'AINode'

export default AINode