'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { FaDatabase } from 'react-icons/fa'

const DataNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4 min-w-[180px] shadow-lg border border-blue-500">
      <div className="flex items-center gap-2 mb-2">
        <FaDatabase className="text-white" />
        <div className="text-white font-semibold">{data.label}</div>
      </div>
      
      <div className="text-xs text-blue-100">
        {data.config?.symbol && `심볼: ${data.config.symbol}`}
        {data.config?.interval && ` | ${data.config.interval}`}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        id="price"
        style={{ background: '#3B82F6', top: '25%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="volume"
        style={{ background: '#3B82F6', top: '50%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="timestamp"
        style={{ background: '#3B82F6', top: '75%' }}
        isConnectable={isConnectable}
      />
    </div>
  )
})

DataNode.displayName = 'DataNode'

export default DataNode