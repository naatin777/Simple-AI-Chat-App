export interface RagSource {
  id: number;
  fileKey: string;
  directoryId: string;
  relativePath: string;
  chunkIndex: number;
  chunkTotal: number;
  score: number;
  excerpt: string;
}

export interface RagPrepareResult {
  context: string;
  sources: RagSource[];
}
