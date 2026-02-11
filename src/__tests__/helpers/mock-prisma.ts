import { vi } from "vitest";

export const mockPrisma = {
  conversation: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  message: {
    create: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
  networkStatus: {
    findMany: vi.fn(),
    upsert: vi.fn(),
  },
  document: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
  $queryRaw: vi.fn(),
};

export function resetMockPrisma() {
  Object.values(mockPrisma).forEach((group) => {
    if (typeof group === "function") {
      group.mockReset();
      return;
    }

    Object.values(group).forEach((fn) => fn.mockReset());
  });
}
