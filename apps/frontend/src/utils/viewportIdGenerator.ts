/**
 * Viewport ID Generator - OHIF Pattern
 * Efficient viewport ID generation and validation
 */

class ViewportIdGenerator {
  private idMap = new Map<number, string>();
  private reverseMap = new Map<string, number>();
  private readonly prefix = 'viewport-';

  /**
   * Get or create viewport ID for index
   */
  getOrCreate(viewportIndex: number): string {
    const cached = this.idMap.get(viewportIndex);
    if (cached) return cached;

    const id = `${this.prefix}${viewportIndex}`;
    this.idMap.set(viewportIndex, id);
    this.reverseMap.set(id, viewportIndex);
    return id;
  }

  /**
   * Get viewport index from ID
   */
  getIndex(viewportId: string): number | null {
    return this.reverseMap.get(viewportId) ?? null;
  }

  /**
   * Check if ID is valid
   */
  isValid(viewportId: string): boolean {
    return this.reverseMap.has(viewportId);
  }

  /**
   * Remove viewport ID from cache
   */
  remove(viewportIndex: number): void {
    const id = this.idMap.get(viewportIndex);
    if (id) {
      this.idMap.delete(viewportIndex);
      this.reverseMap.delete(id);
    }
  }

  /**
   * Clear all IDs
   */
  clear(): void {
    this.idMap.clear();
    this.reverseMap.clear();
  }

  /**
   * Get all active viewport IDs
   */
  getAll(): string[] {
    return Array.from(this.reverseMap.keys());
  }

  /**
   * Get statistics
   */
  getStats(): { count: number; indices: number[] } {
    return {
      count: this.idMap.size,
      indices: Array.from(this.idMap.keys()).sort((a, b) => a - b),
    };
  }
}

// Singleton instance
export const viewportIdGenerator = new ViewportIdGenerator();
export default viewportIdGenerator;

