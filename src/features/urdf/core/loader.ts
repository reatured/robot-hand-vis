/**
 * URDF Loader Utility
 *
 * Loads URDF robot models with their meshes and materials
 * using urdf-loader library.
 */

import URDFLoader from 'urdf-loader'
import * as THREE from 'three'
import { STLLoader } from 'three-stdlib'

export interface URDFLoadOptions {
  /** Scale factor for the model */
  scale?: number
  /** Position offset [x, y, z] */
  position?: [number, number, number]
  /** Rotation offset [x, y, z] in radians */
  rotation?: [number, number, number]
}

/**
 * Load a URDF model from the given path
 *
 * @param urdfPath - Path to the URDF file (relative to public/)
 * @param options - Loading options
 * @returns Promise<THREE.Group> - Loaded URDF model as Three.js group
 */
export async function loadURDF(
  urdfPath: string,
  options: URDFLoadOptions = {}
): Promise<THREE.Group> {
  const {
    scale = 1,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
  } = options

  return new Promise((resolve, reject) => {
    const loader = new URDFLoader()

    // Set up mesh loading manager
    loader.loadMeshCb = (path: string, manager: THREE.LoadingManager, done: (mesh: THREE.Object3D) => void) => {
      // Resolve mesh path relative to URDF file
      const meshPath = resolveMeshPath(urdfPath, path)

      // Load STL mesh
      const stlLoader = new STLLoader()
      stlLoader.load(
        meshPath,
        (geometry) => {
          // Create mesh with basic material
          const material = new THREE.MeshStandardMaterial({
            color: 0xff9900, // Orange default
            metalness: 0.3,
            roughness: 0.7,
          })

          const mesh = new THREE.Mesh(geometry, material)
          done(mesh)
        },
        undefined,
        (error) => {
          console.error(`Failed to load mesh: ${meshPath}`, error)
          // Create a placeholder box on error
          const geometry = new THREE.BoxGeometry(0.01, 0.01, 0.01)
          const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
          const mesh = new THREE.Mesh(geometry, material)
          done(mesh)
        }
      )
    }

    // Load the URDF
    loader.load(
      urdfPath,
      (robot) => {
        // Apply transformations
        robot.scale.setScalar(scale)
        robot.position.set(...position)
        robot.rotation.set(...rotation)

        // Enable shadows for all meshes
        robot.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        resolve(robot)
      },
      undefined,
      (error) => {
        console.error(`Failed to load URDF: ${urdfPath}`, error)
        reject(error)
      }
    )
  })
}

/**
 * Resolve mesh path relative to URDF file location
 */
function resolveMeshPath(urdfPath: string, meshPath: string): string {
  console.log('[resolveMeshPath] urdfPath:', urdfPath)
  console.log('[resolveMeshPath] meshPath (raw):', meshPath)

  // Remove 'package://' prefix if present
  meshPath = meshPath.replace(/^package:\/\/[^/]+\//, '')

  // If mesh path already starts with the urdf directory, it's already resolved
  // This happens when urdf-loader passes an already resolved path
  const urdfDir = urdfPath.substring(0, urdfPath.lastIndexOf('/'))

  // Check if meshPath already contains the full path (starts with urdfDir)
  if (meshPath.startsWith(urdfDir)) {
    console.log('[resolveMeshPath] Path already resolved:', meshPath)
    return meshPath
  }

  // Check if it's already an absolute path starting with /
  if (meshPath.startsWith('/')) {
    console.log('[resolveMeshPath] Absolute path:', meshPath)
    return meshPath
  }

  // Combine paths for relative mesh paths
  const resolved = `${urdfDir}/${meshPath}`
  console.log('[resolveMeshPath] Resolved path:', resolved)
  return resolved
}

/**
 * Get available robot hand models
 */
export function getAvailableModels() {
  return [
    {
      id: 'linker-l10-right',
      name: 'Linker L10 Right Hand',
      urdfPath: '/assets/robots/hands/linker_l10/right/linkerhand_l10_right.urdf',
      thumbnail: null,
    },
    {
      id: 'linker-l10-left',
      name: 'Linker L10 Left Hand',
      urdfPath: '/assets/robots/hands/linker_l10/left/linkerhand_l10_left.urdf',
      thumbnail: null,
    },
    // Add more models as needed
  ]
}
