import {
  isDirectoryPickerSupported,
  pickDirectory,
} from "@/lib/fs/directory-picker";
import { errorResponse, jsonResponse } from "@/lib/openapi/parse";
import { PickedDirectorySchema } from "@/lib/openapi/schemas/directory";

export const runtime = "nodejs";

export async function POST() {
  if (!isDirectoryPickerSupported()) {
    return errorResponse(
      "Directory picker is not supported on this platform",
      501,
    );
  }

  try {
    const picked = await pickDirectory();

    if (!picked) {
      return new Response(null, { status: 204 });
    }

    return jsonResponse(PickedDirectorySchema, picked);
  } catch {
    return errorResponse("Failed to open directory picker", 500);
  }
}
