import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { z } from "@/lib/openapi/extend-zod";
import { errorResponse } from "@/lib/openapi/openapi-responses";
import {
  AddDirectoryBodySchema,
  ConversationDirectoryListSchema,
  ConversationDirectorySchema,
  DirectoryFilesResponseSchema,
  DirectoryTreeResponseSchema,
  PickedDirectorySchema,
} from "@/lib/openapi/schemas/directory";
import {
  ConversationListSchema,
  ConversationSchema,
  CreateConversationBodySchema,
  UpdateConversationBodySchema,
} from "@/lib/openapi/schemas/conversation";
import { SuccessResponseSchema } from "@/lib/openapi/schemas/common";
import { StoredMessageListSchema } from "@/lib/openapi/schemas/message";

export type HttpMethod = "get" | "post" | "patch" | "delete";

const ConversationIdParamsSchema = z.object({
  id: z.string(),
});

const ConversationDirectoryParamsSchema = z.object({
  id: z.string(),
  dirId: z.string(),
});

const DirectoryTreeQuerySchema = z.object({
  relativePath: z.string().optional(),
});

type OpenApiPathRegistration = Parameters<OpenAPIRegistry["registerPath"]>[0];

type ApiRouteDefinition = {
  routeFile: string;
  method: HttpMethod;
  inOpenApi: boolean;
  openApi?: Omit<OpenApiPathRegistration, "method">;
};

/**
 * Canonical list of app/api route handlers.
 * - Add an entry here whenever you create or change a route.ts export.
 * - Set inOpenApi: true and fill openApi when the endpoint should appear in openapi.json.
 * - route-sync.test.ts fails if this list diverges from app/api route files.
 */
export const API_ROUTE_DEFINITIONS = [
  {
    routeFile: "app/api/admin/reset/route.ts",
    method: "post",
    inOpenApi: false,
  },
  {
    routeFile: "app/api/chat/route.ts",
    method: "post",
    inOpenApi: false,
  },
  {
    routeFile: "app/api/conversations/route.ts",
    method: "get",
    inOpenApi: true,
    openApi: {
      path: "/api/conversations",
      tags: ["Conversations"],
      responses: {
        200: {
          description: "List conversations",
          content: {
            "application/json": { schema: ConversationListSchema },
          },
        },
      },
    },
  },
  {
    routeFile: "app/api/conversations/route.ts",
    method: "post",
    inOpenApi: true,
    openApi: {
      path: "/api/conversations",
      tags: ["Conversations"],
      request: {
        body: {
          content: {
            "application/json": { schema: CreateConversationBodySchema },
          },
        },
      },
      responses: {
        200: {
          description: "Created conversation",
          content: {
            "application/json": { schema: ConversationSchema },
          },
        },
      },
    },
  },
  {
    routeFile: "app/api/conversations/[id]/route.ts",
    method: "patch",
    inOpenApi: true,
    openApi: {
      path: "/api/conversations/{id}",
      tags: ["Conversations"],
      request: {
        params: ConversationIdParamsSchema,
        body: {
          content: {
            "application/json": { schema: UpdateConversationBodySchema },
          },
        },
      },
      responses: {
        200: {
          description: "Updated conversation",
          content: {
            "application/json": { schema: ConversationSchema },
          },
        },
        400: errorResponse("Bad request"),
        404: errorResponse("Not found"),
      },
    },
  },
  {
    routeFile: "app/api/conversations/[id]/route.ts",
    method: "delete",
    inOpenApi: true,
    openApi: {
      path: "/api/conversations/{id}",
      tags: ["Conversations"],
      request: {
        params: ConversationIdParamsSchema,
      },
      responses: {
        200: {
          description: "Deleted conversation",
          content: {
            "application/json": { schema: SuccessResponseSchema },
          },
        },
        404: errorResponse("Not found"),
      },
    },
  },
  {
    routeFile: "app/api/conversations/[id]/messages/route.ts",
    method: "get",
    inOpenApi: true,
    openApi: {
      path: "/api/conversations/{id}/messages",
      tags: ["Messages"],
      request: {
        params: ConversationIdParamsSchema,
      },
      responses: {
        200: {
          description: "List messages",
          content: {
            "application/json": { schema: StoredMessageListSchema },
          },
        },
      },
    },
  },
  {
    routeFile: "app/api/conversations/[id]/duplicate/route.ts",
    method: "post",
    inOpenApi: true,
    openApi: {
      path: "/api/conversations/{id}/duplicate",
      tags: ["Conversations"],
      request: {
        params: ConversationIdParamsSchema,
      },
      responses: {
        200: {
          description: "Duplicated conversation",
          content: {
            "application/json": { schema: ConversationSchema },
          },
        },
        404: errorResponse("Not found"),
      },
    },
  },
  {
    routeFile: "app/api/conversations/[id]/duplicate-directories/route.ts",
    method: "post",
    inOpenApi: true,
    openApi: {
      path: "/api/conversations/{id}/duplicate-directories",
      tags: ["Conversations"],
      request: {
        params: ConversationIdParamsSchema,
      },
      responses: {
        200: {
          description: "Duplicated conversation with directories",
          content: {
            "application/json": { schema: ConversationSchema },
          },
        },
        404: errorResponse("Not found"),
      },
    },
  },
  {
    routeFile: "app/api/conversations/[id]/directories/route.ts",
    method: "get",
    inOpenApi: true,
    openApi: {
      path: "/api/conversations/{id}/directories",
      tags: ["Directories"],
      request: {
        params: ConversationIdParamsSchema,
      },
      responses: {
        200: {
          description: "List directories",
          content: {
            "application/json": { schema: ConversationDirectoryListSchema },
          },
        },
        404: errorResponse("Not found"),
      },
    },
  },
  {
    routeFile: "app/api/conversations/[id]/directories/route.ts",
    method: "post",
    inOpenApi: true,
    openApi: {
      path: "/api/conversations/{id}/directories",
      tags: ["Directories"],
      request: {
        params: ConversationIdParamsSchema,
        body: {
          content: {
            "application/json": { schema: AddDirectoryBodySchema },
          },
        },
      },
      responses: {
        200: {
          description: "Added directory",
          content: {
            "application/json": { schema: ConversationDirectorySchema },
          },
        },
        400: errorResponse("Bad request"),
        404: errorResponse("Not found"),
        409: errorResponse("Conflict"),
      },
    },
  },
  {
    routeFile: "app/api/conversations/[id]/directories/[dirId]/route.ts",
    method: "delete",
    inOpenApi: true,
    openApi: {
      path: "/api/conversations/{id}/directories/{dirId}",
      tags: ["Directories"],
      request: {
        params: ConversationDirectoryParamsSchema,
      },
      responses: {
        200: {
          description: "Removed directory",
          content: {
            "application/json": { schema: SuccessResponseSchema },
          },
        },
        404: errorResponse("Not found"),
      },
    },
  },
  {
    routeFile: "app/api/conversations/[id]/directories/[dirId]/content/route.ts",
    method: "get",
    inOpenApi: false,
  },
  {
    routeFile: "app/api/conversations/[id]/directories/[dirId]/tree/route.ts",
    method: "get",
    inOpenApi: true,
    openApi: {
      path: "/api/conversations/{id}/directories/{dirId}/tree",
      tags: ["Directories"],
      request: {
        params: ConversationDirectoryParamsSchema,
        query: DirectoryTreeQuerySchema,
      },
      responses: {
        200: {
          description: "Directory tree nodes",
          content: {
            "application/json": { schema: DirectoryTreeResponseSchema },
          },
        },
        403: errorResponse("Forbidden"),
        404: errorResponse("Not found"),
        500: errorResponse("Server error"),
      },
    },
  },
  {
    routeFile: "app/api/conversations/[id]/directories/[dirId]/files/route.ts",
    method: "get",
    inOpenApi: true,
    openApi: {
      path: "/api/conversations/{id}/directories/{dirId}/files",
      tags: ["Directories"],
      request: {
        params: ConversationDirectoryParamsSchema,
        query: DirectoryTreeQuerySchema,
      },
      responses: {
        200: {
          description: "All files under a directory path",
          content: {
            "application/json": { schema: DirectoryFilesResponseSchema },
          },
        },
        403: errorResponse("Forbidden"),
        404: errorResponse("Not found"),
        500: errorResponse("Server error"),
      },
    },
  },
  {
    routeFile: "app/api/directories/pick/route.ts",
    method: "post",
    inOpenApi: true,
    openApi: {
      path: "/api/directories/pick",
      tags: ["Directories"],
      responses: {
        200: {
          description: "Picked directory",
          content: {
            "application/json": { schema: PickedDirectorySchema },
          },
        },
        204: { description: "Picker cancelled" },
        501: errorResponse("Not supported"),
        500: errorResponse("Server error"),
      },
    },
  },
] as const satisfies readonly ApiRouteDefinition[];

export function registerApiRoutes(registry: OpenAPIRegistry) {
  for (const definition of API_ROUTE_DEFINITIONS) {
    if (!definition.inOpenApi || !definition.openApi) {
      continue;
    }

    registry.registerPath({
      method: definition.method,
      ...definition.openApi,
    });
  }
}
