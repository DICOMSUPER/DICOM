/**
 * Hanging Protocol Service
 * 
 * Auto-arranges viewports based on study type, modality, and clinical context
 * Inspired by OHIF Viewer's hanging protocol system
 */

export interface ViewportConfig {
  viewportId: string;
  orientation?: 'AXIAL' | 'SAGITTAL' | 'CORONAL';
  seriesMatchingRules?: {
    modality?: string;
    seriesDescription?: string[];
    seriesNumber?: number;
    bodyPart?: string;
  };
  toolGroupId?: string;
  initialImageIndex?: number;
}

export interface HangingProtocolDefinition {
  id: string;
  name: string;
  description: string;
  
  // Matching rules
  matchingRules: {
    studyDescription?: string[];
    modalities?: string[];
    bodyPart?: string[];
    numberOfSeries?: { min?: number; max?: number };
  };
  
  // Layout configuration
  layout: {
    rows: number;
    cols: number;
    layoutType?: 'grid' | 'custom';
  };
  
  // Viewport configurations
  viewports: ViewportConfig[];
  
  // Synchronization
  syncGroups?: {
    groupId: string;
    viewportIds: string[];
    syncModes: string[];
  }[];
  
  // Priority (higher = more specific, applied first)
  priority: number;
}

class HangingProtocolService {
  private protocols: Map<string, HangingProtocolDefinition> = new Map();

  constructor() {
    this.registerDefaultProtocols();
  }

  /**
   * Register default hanging protocols
   */
  private registerDefaultProtocols() {
    // CT Chest Protocol
    this.registerProtocol({
      id: 'ct-chest-3view',
      name: 'CT Chest - 3 View',
      description: 'Axial, Sagittal, Coronal views for CT chest',
      priority: 80,
      matchingRules: {
        studyDescription: ['chest', 'thorax', 'lung'],
        modalities: ['CT'],
      },
      layout: {
        rows: 1,
        cols: 3,
      },
      viewports: [
        {
          viewportId: 'viewport-0',
          orientation: 'AXIAL',
          toolGroupId: 'mpr-group',
        },
        {
          viewportId: 'viewport-1',
          orientation: 'SAGITTAL',
          toolGroupId: 'mpr-group',
        },
        {
          viewportId: 'viewport-2',
          orientation: 'CORONAL',
          toolGroupId: 'mpr-group',
        },
      ],
      syncGroups: [
        {
          groupId: 'mpr-sync',
          viewportIds: ['viewport-0', 'viewport-1', 'viewport-2'],
          syncModes: ['scroll'],
        },
      ],
    });

    // MR Brain Protocol
    this.registerProtocol({
      id: 'mr-brain-4view',
      name: 'MR Brain - 4 View',
      description: 'T1, T2, FLAIR, DWI for brain MRI',
      priority: 90,
      matchingRules: {
        studyDescription: ['brain', 'head', 'neuro'],
        modalities: ['MR'],
        numberOfSeries: { min: 3 },
      },
      layout: {
        rows: 2,
        cols: 2,
      },
      viewports: [
        {
          viewportId: 'viewport-0',
          seriesMatchingRules: {
            seriesDescription: ['t1', 't1w'],
          },
        },
        {
          viewportId: 'viewport-1',
          seriesMatchingRules: {
            seriesDescription: ['t2', 't2w'],
          },
        },
        {
          viewportId: 'viewport-2',
          seriesMatchingRules: {
            seriesDescription: ['flair'],
          },
        },
        {
          viewportId: 'viewport-3',
          seriesMatchingRules: {
            seriesDescription: ['dwi', 'diffusion'],
          },
        },
      ],
      syncGroups: [
        {
          groupId: 'brain-sync',
          viewportIds: ['viewport-0', 'viewport-1', 'viewport-2', 'viewport-3'],
          syncModes: ['pan', 'zoom', 'scroll'],
        },
      ],
    });

    // CT Abdomen Protocol
    this.registerProtocol({
      id: 'ct-abdomen-2phase',
      name: 'CT Abdomen - 2 Phase',
      description: 'Arterial and venous phases side-by-side',
      priority: 85,
      matchingRules: {
        studyDescription: ['abdomen', 'liver', 'pancreas'],
        modalities: ['CT'],
        numberOfSeries: { min: 2 },
      },
      layout: {
        rows: 1,
        cols: 2,
      },
      viewports: [
        {
          viewportId: 'viewport-0',
          seriesMatchingRules: {
            seriesDescription: ['arterial', 'art'],
          },
        },
        {
          viewportId: 'viewport-1',
          seriesMatchingRules: {
            seriesDescription: ['venous', 'portal', 'ven'],
          },
        },
      ],
      syncGroups: [
        {
          groupId: 'phase-sync',
          viewportIds: ['viewport-0', 'viewport-1'],
          syncModes: ['pan', 'zoom', 'scroll', 'windowLevel'],
        },
      ],
    });

    // Default Single Viewport
    this.registerProtocol({
      id: 'default-single',
      name: 'Default - Single View',
      description: 'Single viewport for general viewing',
      priority: 1, // Lowest priority (fallback)
      matchingRules: {},
      layout: {
        rows: 1,
        cols: 1,
      },
      viewports: [
        {
          viewportId: 'viewport-0',
        },
      ],
    });

    console.log(`✅ Registered ${this.protocols.size} hanging protocols`);
  }

  /**
   * Register a custom hanging protocol
   */
  registerProtocol(protocol: HangingProtocolDefinition) {
    this.protocols.set(protocol.id, protocol);
    console.log(`📋 Registered protocol: ${protocol.name}`);
  }

  /**
   * Find best matching protocol for a study
   */
  findBestProtocol(studyMetadata: {
    studyDescription?: string;
    modalities?: string[];
    bodyPart?: string;
    numberOfSeries?: number;
  }): HangingProtocolDefinition | null {
    const matchingProtocols: { protocol: HangingProtocolDefinition; score: number }[] = [];

    this.protocols.forEach(protocol => {
      const score = this.calculateMatchScore(protocol, studyMetadata);
      if (score > 0) {
        matchingProtocols.push({ protocol, score });
      }
    });

    if (matchingProtocols.length === 0) {
      // Return default protocol
      return this.protocols.get('default-single') || null;
    }

    // Sort by score (higher first), then by priority
    matchingProtocols.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      return b.protocol.priority - a.protocol.priority;
    });

    const bestMatch = matchingProtocols[0];
    console.log(`🎯 Best protocol match: ${bestMatch.protocol.name} (score: ${bestMatch.score})`);
    
    return bestMatch.protocol;
  }

  /**
   * Calculate match score for a protocol
   */
  private calculateMatchScore(
    protocol: HangingProtocolDefinition,
    studyMetadata: any
  ): number {
    let score = 0;
    const rules = protocol.matchingRules;

    // Match study description
    if (rules.studyDescription && studyMetadata.studyDescription) {
      const studyDesc = studyMetadata.studyDescription.toLowerCase();
      const matches = rules.studyDescription.some(keyword =>
        studyDesc.includes(keyword.toLowerCase())
      );
      if (matches) score += 50;
    }

    // Match modalities
    if (rules.modalities && studyMetadata.modalities) {
      const modalityMatches = rules.modalities.some(modality =>
        studyMetadata.modalities.includes(modality)
      );
      if (modalityMatches) score += 30;
    }

    // Match body part
    if (rules.bodyPart && studyMetadata.bodyPart) {
      const bodyPartMatches = rules.bodyPart.some(part =>
        studyMetadata.bodyPart.toLowerCase().includes(part.toLowerCase())
      );
      if (bodyPartMatches) score += 20;
    }

    // Match number of series
    if (rules.numberOfSeries && studyMetadata.numberOfSeries) {
      const { min, max } = rules.numberOfSeries;
      const count = studyMetadata.numberOfSeries;
      
      if ((min === undefined || count >= min) && (max === undefined || count <= max)) {
        score += 10;
      }
    }

    return score;
  }

  /**
   * Get protocol by ID
   */
  getProtocol(protocolId: string): HangingProtocolDefinition | null {
    return this.protocols.get(protocolId) || null;
  }

  /**
   * Get all registered protocols
   */
  getAllProtocols(): HangingProtocolDefinition[] {
    return Array.from(this.protocols.values());
  }

  /**
   * Remove protocol
   */
  removeProtocol(protocolId: string) {
    this.protocols.delete(protocolId);
  }
}

// Singleton instance
export const hangingProtocolService = new HangingProtocolService();

