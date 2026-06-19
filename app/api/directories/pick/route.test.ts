import { vi } from "vitest";

const pickDirectoryMock = vi.hoisted(() => vi.fn());
const isDirectoryPickerSupportedMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/fs/directory-picker", () => ({
  pickDirectory: pickDirectoryMock,
  isDirectoryPickerSupported: isDirectoryPickerSupportedMock,
}));

describe("POST /api/directories/pick", () => {
  beforeEach(() => {
    pickDirectoryMock.mockReset();
    isDirectoryPickerSupportedMock.mockReset();
  });

  it("returns 501 when the picker is not supported", async () => {
    isDirectoryPickerSupportedMock.mockReturnValue(false);

    const { POST } = await import("./route");
    const response = await POST();

    expect(response.status).toBe(501);
  });

  it("returns 204 when the user cancels the picker", async () => {
    isDirectoryPickerSupportedMock.mockReturnValue(true);
    pickDirectoryMock.mockResolvedValue(null);

    const { POST } = await import("./route");
    const response = await POST();

    expect(response.status).toBe(204);
  });

  it("returns the picked directory", async () => {
    isDirectoryPickerSupportedMock.mockReturnValue(true);
    pickDirectoryMock.mockResolvedValue({
      path: "/Users/test/project",
      name: "project",
    });

    const { POST } = await import("./route");
    const response = await POST();
    const body = (await response.json()) as { path: string; name: string };

    expect(response.status).toBe(200);
    expect(body).toEqual({
      path: "/Users/test/project",
      name: "project",
    });
  });

  it("returns 500 when the picker throws", async () => {
    isDirectoryPickerSupportedMock.mockReturnValue(true);
    pickDirectoryMock.mockRejectedValue(new Error("picker failed"));

    const { POST } = await import("./route");
    const response = await POST();

    expect(response.status).toBe(500);
  });
});
