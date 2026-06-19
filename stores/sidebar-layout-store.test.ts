import { act } from "@testing-library/react";

import {
  MAX_WIDTH_PX,
  MIN_WIDTH_PX,
  useSidebarLayoutStore,
} from "./sidebar-layout-store";

describe("useSidebarLayoutStore", () => {
  beforeEach(() => {
    act(() => {
      useSidebarLayoutStore.setState({
        leftWidthPx: 256,
        rightWidthPx: 256,
      });
    });
  });

  it("clamps left sidebar width", () => {
    act(() => {
      useSidebarLayoutStore.getState().setLeftWidth(999);
    });

    expect(useSidebarLayoutStore.getState().leftWidthPx).toBe(MAX_WIDTH_PX);
  });

  it("clamps right sidebar width", () => {
    act(() => {
      useSidebarLayoutStore.getState().setRightWidth(10);
    });

    expect(useSidebarLayoutStore.getState().rightWidthPx).toBe(MIN_WIDTH_PX);
  });
});
