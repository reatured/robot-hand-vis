/**
 * Linker L10 Right Hand - Pre-processed Metadata
 *
 * Parsed from URDF: /assets/robots/hands/linker_l10/right/linkerhand_l10_right.urdf
 *
 * This data structure eliminates the need for runtime URDF parsing.
 * All joint positions, axes, and limits are extracted from the original URDF.
 */

import { RobotHandMetadata } from '../types'

export const LINKER_L10_RIGHT: RobotHandMetadata = {
  id: 'linker-l10-right',
  name: 'Linker L10 Right Hand',
  brand: 'Linker',
  model: 'L10',
  handedness: 'right',
  urdfPath: '/assets/robots/hands/linker_l10/right/linkerhand_l10_right.urdf',
  baseLink: 'hand_base_link',

  fingers: {
    // Thumb: 5 DOF (cmc_roll, cmc_yaw, cmc_pitch, mcp, ip)
    thumb: {
      name: 'thumb',
      joints: [
        {
          name: 'thumb_cmc_roll',
          type: 'revolute',
          position: [-0.013419, 0.012551, 0.060602],
          axis: [0.99996, 0, -0.0087265],
          limits: {
            lower: 0,
            upper: 1.1339,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'hand_base_link',
          childLink: 'thumb_metacarpals_base1',
        },
        {
          name: 'thumb_cmc_yaw',
          type: 'revolute',
          position: [0.035797, -0.00065879, 0.00045944],
          axis: [0.008517, -0.21782, -0.97595],
          limits: {
            lower: 0,
            upper: 1.9189,
            effort: 100,
            velocity: 0,
          },
          parentLink: 'thumb_metacarpals_base1',
          childLink: 'thumb_metacarpals_base2',
        },
        {
          name: 'thumb_cmc_pitch',
          type: 'revolute',
          position: [0.0046051, 0.014383, -0.0051478],
          axis: [0, 1, 0],
          limits: {
            lower: 0,
            upper: 0.5146,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'thumb_metacarpals_base2',
          childLink: 'thumb_metacarpals',
        },
        {
          name: 'thumb_mcp',
          type: 'revolute',
          position: [0.0061722, 0, 0.047968],
          axis: [0, 1, 0],
          limits: {
            lower: 0,
            upper: 0.7152,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'thumb_metacarpals',
          childLink: 'thumb_proximal',
        },
        {
          name: 'thumb_ip',
          type: 'revolute',
          position: [-0.00017064, 0, 0.038665],
          axis: [0, 1, 0],
          limits: {
            lower: 0,
            upper: 0.7763,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'thumb_proximal',
          childLink: 'thumb_distal',
        },
      ],
    },

    // Index: 4 DOF (mcp_roll, mcp_pitch, pip, dip)
    index: {
      name: 'index',
      joints: [
        {
          name: 'index_mcp_roll',
          type: 'revolute',
          position: [-0.0021643, 0.026654, 0.13253],
          axis: [-0.99996, 0, 0.0087265],
          limits: {
            lower: 0,
            upper: 0.2181,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'hand_base_link',
          childLink: 'index_metacarpals',
        },
        {
          name: 'index_mcp_pitch',
          type: 'revolute',
          position: [0.0020763, 0, 0.015294],
          axis: [0, 1, 0],
          limits: {
            lower: 0,
            upper: 1.3607,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'index_metacarpals',
          childLink: 'index_proximal',
        },
        {
          name: 'index_pip',
          type: 'revolute',
          position: [-0.0013807, 0, 0.035624],
          axis: [0, 1, 0],
          limits: {
            lower: 0,
            upper: 1.8317,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'index_proximal',
          childLink: 'index_middle',
        },
        {
          name: 'index_dip',
          type: 'revolute',
          position: [-0.0054686, 0, 0.025665],
          axis: [0, 1, 0],
          limits: {
            lower: 0,
            upper: 1.8317,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'index_middle',
          childLink: 'index_distal',
        },
      ],
    },

    // Middle: 3 DOF (mcp_pitch, pip, dip)
    middle: {
      name: 'middle',
      joints: [
        {
          name: 'middle_mcp_pitch',
          type: 'revolute',
          position: [-0.0021316, 0.0076542, 0.15281],
          axis: [0, 1, 0],
          limits: {
            lower: 0,
            upper: 1.3607,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'hand_base_link',
          childLink: 'middle_proximal',
        },
        {
          name: 'middle_pip',
          type: 'revolute',
          position: [-0.001397, 0, 0.035623],
          axis: [0, 1, 0],
          limits: {
            lower: 0,
            upper: 1.8317,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'middle_proximal',
          childLink: 'middle_middle',
        },
        {
          name: 'middle_dip',
          type: 'revolute',
          position: [-0.0055098, 0, 0.025656],
          axis: [0, 1, 0],
          limits: {
            lower: 0,
            upper: 0.628,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'middle_middle',
          childLink: 'middle_distal',
        },
      ],
    },

    // Ring: 4 DOF (mcp_roll, mcp_pitch, pip, dip)
    ring: {
      name: 'ring',
      joints: [
        {
          name: 'ring_mcp_roll',
          type: 'revolute',
          position: [-0.0021643, -0.011346, 0.13253],
          axis: [0.99996, 0, 0.0087265],
          limits: {
            lower: 0,
            upper: 0.2181,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'hand_base_link',
          childLink: 'ring_metacarpals',
        },
        {
          name: 'ring_mcp_pitch',
          type: 'revolute',
          position: [0.0020763, 0, 0.015294],
          axis: [0, 1, 0],
          limits: {
            lower: 0,
            upper: 1.3607,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'ring_metacarpals',
          childLink: 'ring_proximal',
        },
        {
          name: 'ring_pip',
          type: 'revolute',
          position: [-0.0013807, 0, 0.035624],
          axis: [0, 1, 0],
          limits: {
            lower: 0,
            upper: 1.8317,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'ring_proximal',
          childLink: 'ring_middle',
        },
        {
          name: 'ring_dip',
          type: 'revolute',
          position: [-0.0054686, 0, 0.025665],
          axis: [0, 1, 0],
          limits: {
            lower: 0,
            upper: 0.628,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'ring_middle',
          childLink: 'ring_distal',
        },
      ],
    },

    // Pinky: 4 DOF (mcp_roll, mcp_pitch, pip, dip)
    pinky: {
      name: 'pinky',
      joints: [
        {
          name: 'pinky_mcp_roll',
          type: 'revolute',
          position: [-0.00012074, -0.030346, 0.12755],
          axis: [0.99996, 0, 0.0087265],
          limits: {
            lower: 0,
            upper: 0.3489,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'hand_base_link',
          childLink: 'pinky_metacarpals',
        },
        {
          name: 'pinky_mcp_pitch',
          type: 'revolute',
          position: [0.0020763, 0, 0.015294],
          axis: [0, 1, 0],
          limits: {
            lower: 0,
            upper: 1.3607,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'pinky_metacarpals',
          childLink: 'pinky_proximal',
        },
        {
          name: 'pinky_pip',
          type: 'revolute',
          position: [-0.0013807, 0, 0.035624],
          axis: [0, 1, 0],
          limits: {
            lower: 0,
            upper: 1.8317,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'pinky_proximal',
          childLink: 'pinky_middle',
        },
        {
          name: 'pinky_dip',
          type: 'revolute',
          position: [-0.0054686, 0, 0.025665],
          axis: [0, 1, 0],
          limits: {
            lower: 0,
            upper: 0.628,
            effort: 100,
            velocity: 1,
          },
          parentLink: 'pinky_middle',
          childLink: 'pinky_distal',
        },
      ],
    },
  },
}
