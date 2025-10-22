# Assets Feature - AI Development Context

## ⚠️ AI DEVELOPER INSTRUCTIONS
After ANY changes: Update this file, PROJECT_OVERVIEW.md, commit with `feat(assets): {desc} + update docs`

---

## Metadata
- **Feature:** Assets
- **Status:** 🚧 Partial
- **Completion:** 10%
- **Last Modified:** 2025-10-22
- **Milestone:** M7
- **Dependencies:** None
- **Used By:** urdf, inspector

---

## Purpose
Manages robot hand model assets (URDFs, meshes, previews) with manifest-based loading system.

**Outputs:** ModelAsset[] with metadata and loading functions

---

## Current State

### ✅ Assets Exist
- 8 robot hand models in `public/assets/robots/hands/`
- Gallery preview images in `public/assets/doc/gallery/`
- URDF files with mesh references

### ❌ Not Implemented
- Asset manifest system (`models.json`)
- Asset loading logic
- Preview image lazy loading
- Model metadata management

---

## Planned Architecture

```
assets/
├── AI_CONTEXT.md
├── types.ts
├── core/
│   ├── manifestLoader.ts     ← Load models.json
│   └── assetRegistry.ts      ← Asset catalog
└── hooks/
    └── useAssetLoader.ts     ← React integration
```

---

## Requirements (From MainPlan M7)

### Asset Manifest Structure

**File:** `public/assets/manifests/models.json`

```json
{
  "version": "1.0",
  "models": [
    {
      "id": "shadow-hand-right",
      "name": "Shadow Hand (Right)",
      "type": "dexterous",
      "urdfPath": "/assets/robots/hands/shadow_hand/shadow_hand_right.urdf",
      "preview": "/assets/doc/gallery/shadow_rt.webp",
      "metadata": {
        "fingers": 5,
        "dof": 24,
        "manufacturer": "Shadow Robot Company",
        "scale": 1.0
      }
    },
    {
      "id": "allegro-hand-right",
      "name": "Allegro Hand (Right)",
      "type": "research",
      "urdfPath": "/assets/robots/hands/allegro_hand/allegro_hand_right.urdf",
      "preview": "/assets/doc/gallery/allegro_rt.webp",
      "metadata": {
        "fingers": 4,
        "dof": 16,
        "manufacturer": "Wonik Robotics"
      }
    }
    // ... more models
  ]
}
```

### Asset Types

```typescript
// types.ts
export interface ModelAsset {
  id: string
  name: string
  type: 'dexterous' | 'prosthetic' | 'gripper' | 'research'
  urdfPath: string
  preview: string | null
  metadata: ModelMetadata
}

export interface ModelMetadata {
  fingers: number
  dof: number              // Degrees of freedom
  manufacturer?: string
  scale?: number           // Default scale factor
  description?: string
}

export interface AssetManifest {
  version: string
  models: ModelAsset[]
}
```

---

## Implementation Plan

### Phase 1: Manifest Creation (2 hours)

1. **Audit Existing Assets:**
   - List all URDFs in `public/assets/robots/hands/`
   - Match with preview images
   - Document metadata (fingers, DOF)

2. **Create models.json:**
   - Define all 8 models
   - Verify paths are correct
   - Add metadata

### Phase 2: Loading Logic (3 hours)

```typescript
// core/manifestLoader.ts
export async function loadAssetManifest(): Promise<AssetManifest> {
  const response = await fetch('/assets/manifests/models.json')
  if (!response.ok) {
    throw new Error('Failed to load asset manifest')
  }
  const manifest: AssetManifest = await response.json()
  return manifest
}

// core/assetRegistry.ts
class AssetRegistry {
  private models: Map<string, ModelAsset> = new Map()

  async initialize(): Promise<void> {
    const manifest = await loadAssetManifest()
    manifest.models.forEach(model => {
      this.models.set(model.id, model)
    })
  }

  getModel(id: string): ModelAsset | undefined {
    return this.models.get(id)
  }

  getAllModels(): ModelAsset[] {
    return Array.from(this.models.values())
  }

  filterByType(type: ModelAsset['type']): ModelAsset[] {
    return this.getAllModels().filter(m => m.type === type)
  }
}

export const assetRegistry = new AssetRegistry()
```

### Phase 3: React Integration (2 hours)

```typescript
// hooks/useAssetLoader.ts
export function useAssetLoader() {
  const [models, setModels] = useState<ModelAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        await assetRegistry.initialize()
        setModels(assetRegistry.getAllModels())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { models, loading, error }
}
```

### Phase 4: Lazy Preview Loading (1 hour)

```typescript
export function useLazyImage(src: string | null) {
  const [loaded, setLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!src) return

    const img = new Image()
    img.onload = () => {
      setImageSrc(src)
      setLoaded(true)
    }
    img.src = src
  }, [src])

  return { imageSrc, loaded }
}
```

---

## Asset Inventory

### Available Models (8 total)

Based on `public/assets/robots/hands/`:

1. **DClaw Gripper** - 3-finger gripper
2. **Schunk SVH Hand** - 5-finger anthropomorphic
3. **Shadow Hand** - Advanced dexterous
4. **Barrett Hand** - Industrial gripper
5. **Allegro Hand** - Research platform
6. **Inspire Hand** - Prosthetic
7. **Leap Hand** - Low-cost dexterous
8. **Ability Hand** - Prosthetic

**Note:** Linker L10/L20 referenced in code but may not exist

---

## Integration with Features

### URDF Feature
```typescript
// In urdf/core/loader.ts
import { assetRegistry } from '@/features/assets'

const model = assetRegistry.getModel('shadow-hand-right')
const robot = await loadURDF(model.urdfPath, {
  scale: model.metadata.scale || 5
})
```

### Inspector Feature
```typescript
// In inspector/components/ModelTab.tsx
const { models } = useAssetLoader()

<select>
  {models.map(model => (
    <option key={model.id} value={model.id}>
      {model.name}
    </option>
  ))}
</select>
```

---

## Testing Plan

1. **Manifest Loading:**
   - Verify JSON parses correctly
   - Check all paths are valid
   - Confirm metadata is accurate

2. **Asset Registry:**
   - Test getModel()
   - Test filterByType()
   - Test with missing model IDs

3. **Preview Loading:**
   - Verify lazy loading works
   - Check placeholder display
   - Test missing previews (null)

---

## Known Issues

### ⚠️ Moderate
1. **Missing Models** - Linker L10/L20 referenced but may not exist
2. **Preview Images** - Some models may not have preview images

---

## Next Steps

1. **Audit Assets** (1 hour)
   - List all URDFs
   - Verify mesh files exist
   - Match with previews

2. **Create models.json** (1 hour)
   - Document all 8 models
   - Add metadata

3. **Implement Loading** (3 hours)
   - manifestLoader.ts
   - assetRegistry.ts
   - useAssetLoader hook

4. **Update URDF Loader** (1 hour)
   - Use asset registry instead of hardcoded paths

5. **Add to Inspector** (2 hours)
   - Model selection dropdown
   - Preview display

---

## AI Guidelines

- Verify URDF paths before adding to manifest
- Check mesh file references in URDFs
- Provide fallback for missing previews
- Cache manifest after first load
- Handle network errors gracefully

---

## References

- MainPlan: Section 1.6 (Phase 1) and M7
- Existing assets: `public/assets/robots/hands/`

---

**Status:** 🚧 Assets exist, manifest system not implemented
**Estimated Time:** 8-10 hours
**Next Action:** Audit assets → Create manifest → Implement loading
