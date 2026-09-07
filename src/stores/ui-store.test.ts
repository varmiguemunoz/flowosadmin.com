import test from "node:test";
import assert from "node:assert/strict";

import { useUiStore } from "./ui-store.ts";

// Reset store between tests (Zustand stores are module singletons).
function reset() {
  useUiStore.setState({ sidebarOpen: false });
}

test("sidebar starts closed", () => {
  reset();
  assert.equal(useUiStore.getState().sidebarOpen, false);
});

test("openSidebar / closeSidebar set the flag", () => {
  reset();
  useUiStore.getState().openSidebar();
  assert.equal(useUiStore.getState().sidebarOpen, true);
  useUiStore.getState().closeSidebar();
  assert.equal(useUiStore.getState().sidebarOpen, false);
});

test("toggleSidebar flips the flag", () => {
  reset();
  useUiStore.getState().toggleSidebar();
  assert.equal(useUiStore.getState().sidebarOpen, true);
  useUiStore.getState().toggleSidebar();
  assert.equal(useUiStore.getState().sidebarOpen, false);
});
