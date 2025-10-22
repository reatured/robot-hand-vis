'use client'

/**
 * JointsTab Component
 * Displays list of joints with filtering and selection
 */

import { useMemo } from 'react'
import { useStore } from '@/store'
import { Dropdown } from '@/shared/components/Dropdown'
import { Toggle } from '@/shared/components/Toggle'
import { getJointFinger } from '../../urdf/core/parseUrdf'
import { UrdfJointInfo } from '../../urdf/types'

export function JointsTab() {
  const joints = useStore((state) => (state as any).joints || [])
  const fingerFilter = useStore((state) => (state as any).fingerFilter)
  const setFingerFilter = useStore((state) => (state as any).setFingerFilter)
  const selectedJointName = useStore((state) => (state as any).selectedJointName)
  const setSelectedJoint = useStore((state) => (state as any).setSelectedJoint)
  const showAxisLines = useStore((state) => (state as any).showAxisLines)
  const setShowAxisLines = useStore((state) => (state as any).setShowAxisLines)

  // Filter joints based on selection and type
  const filteredJoints = useMemo(() => {
    return joints.filter((joint: UrdfJointInfo) => {
      // Only show rotatable joints
      if (joint.type === 'fixed' || joint.type === 'floating' || joint.type === 'planar') {
        return false
      }

      // Apply finger filter
      if (fingerFilter !== 'all') {
        const jointFinger = getJointFinger(joint.name)
        if (jointFinger !== fingerFilter) {
          return false
        }
      }

      return true
    })
  }, [joints, fingerFilter])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="space-y-3">
        <Toggle
          label="Show Axes"
          checked={showAxisLines}
          onChange={setShowAxisLines}
        />

        <Dropdown
          label="Filter by Finger"
          value={fingerFilter}
          options={[
            { value: 'all', label: 'All Fingers' },
            { value: 'thumb', label: 'Thumb' },
            { value: 'index', label: 'Index' },
            { value: 'middle', label: 'Middle' },
            { value: 'ring', label: 'Ring' },
            { value: 'pinky', label: 'Pinky' },
            { value: 'other', label: 'Other' },
          ]}
          onChange={setFingerFilter}
        />
      </div>

      {/* Joint count */}
      <div className="text-xs text-gray-500">
        {filteredJoints.length} joint{filteredJoints.length !== 1 ? 's' : ''} found
      </div>

      {/* Joints list */}
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {filteredJoints.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8">
            No joints found
          </div>
        ) : (
          filteredJoints.map((joint: UrdfJointInfo) => (
            <JointItem
              key={joint.name}
              joint={joint}
              isSelected={joint.name === selectedJointName}
              onSelect={() => setSelectedJoint(joint.name)}
            />
          ))
        )}
      </div>

      {/* Selected joint details */}
      {selectedJointName && (
        <SelectedJointDetails
          joint={joints.find((j: UrdfJointInfo) => j.name === selectedJointName)}
        />
      )}
    </div>
  )
}

interface JointItemProps {
  joint: UrdfJointInfo
  isSelected: boolean
  onSelect: () => void
}

function JointItem({ joint, isSelected, onSelect }: JointItemProps) {
  const angleDeg = (joint.currentAngle * 180 / Math.PI).toFixed(1)

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2 rounded transition-colors ${
        isSelected
          ? 'bg-cyan-600 text-white'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{joint.name}</div>
          <div className="text-xs opacity-75">
            {joint.type} • {angleDeg}°
          </div>
        </div>
        <div
          className="w-3 h-3 rounded-full ml-2 flex-shrink-0"
          style={{
            backgroundColor: `#${joint.type === 'revolute' ? '00ffff' : joint.type === 'continuous' ? 'ffff00' : 'ff00ff'}`,
          }}
        />
      </div>
    </button>
  )
}

interface SelectedJointDetailsProps {
  joint?: UrdfJointInfo
}

function SelectedJointDetails({ joint }: SelectedJointDetailsProps) {
  if (!joint) return null

  const angleDeg = (joint.currentAngle * 180 / Math.PI).toFixed(1)

  return (
    <div className="border-t border-gray-700 pt-4">
      <h4 className="text-sm font-semibold text-white mb-3">Joint Details</h4>
      <div className="space-y-2 text-xs">
        <DetailRow label="Name" value={joint.name} />
        <DetailRow label="Type" value={joint.type} />
        <DetailRow label="Angle" value={`${angleDeg}° (${joint.currentAngle.toFixed(3)} rad)`} />
        <DetailRow
          label="Axis"
          value={`[${joint.axis.x.toFixed(2)}, ${joint.axis.y.toFixed(2)}, ${joint.axis.z.toFixed(2)}]`}
        />
        {joint.limits && (
          <>
            <DetailRow
              label="Limits"
              value={`${(joint.limits.lower * 180 / Math.PI).toFixed(0)}° to ${(joint.limits.upper * 180 / Math.PI).toFixed(0)}°`}
            />
          </>
        )}
        <DetailRow label="Parent" value={joint.parentLink} />
        <DetailRow label="Child" value={joint.childLink} />
      </div>
    </div>
  )
}

interface DetailRowProps {
  label: string
  value: string
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}:</span>
      <span className="text-gray-300 font-mono">{value}</span>
    </div>
  )
}
