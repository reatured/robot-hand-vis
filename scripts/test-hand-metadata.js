#!/usr/bin/env node

/**
 * Quick test script for hand metadata system
 * Run with: node scripts/test-hand-metadata.js
 */

// Import the compiled data (assumes TypeScript is compiled)
const { LINKER_L10_RIGHT } = require('../src/features/urdf/data/linker-l10-right')

console.log('🤖 Linker L10 Right Hand - Metadata Test\n')
console.log('Model Info:')
console.log(`  ID: ${LINKER_L10_RIGHT.id}`)
console.log(`  Name: ${LINKER_L10_RIGHT.name}`)
console.log(`  Brand: ${LINKER_L10_RIGHT.brand}`)
console.log(`  Handedness: ${LINKER_L10_RIGHT.handedness}`)
console.log()

console.log('Finger Structure:')
for (const [fingerName, finger] of Object.entries(LINKER_L10_RIGHT.fingers)) {
  if (finger) {
    console.log(`  ${fingerName}: ${finger.joints.length} joints`)
    finger.joints.forEach((joint, i) => {
      console.log(`    ${i + 1}. ${joint.name}`)
    })
  }
}

const totalJoints = Object.values(LINKER_L10_RIGHT.fingers)
  .filter((f) => f !== undefined)
  .reduce((sum, finger) => sum + finger.joints.length, 0)

console.log()
console.log(`Total: ${totalJoints} joints`)
console.log()
console.log('✅ Metadata loaded successfully!')
