export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 200;
export const TOP_K = 8;
export const MAX_CONTEXT_CHARS = 12000;

/** Set `RAG_USE_EMBEDDINGS=false` to skip embeddings and inject file text directly. */
export const RAG_USE_EMBEDDINGS = process.env.RAG_USE_EMBEDDINGS !== "false";
