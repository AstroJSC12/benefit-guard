import { vi } from "vitest";

type TestSessionUser = {
  id: string;
  email: string;
  name: string;
  zipCode?: string;
};

const defaultUser: TestSessionUser = {
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  zipCode: "94105",
};

export const mockGetServerSession = vi.fn();

export function createMockSession(userOverrides: Partial<TestSessionUser> = {}) {
  return {
    user: {
      ...defaultUser,
      ...userOverrides,
    },
  };
}

export function mockAuthenticatedSession(userOverrides: Partial<TestSessionUser> = {}) {
  mockGetServerSession.mockResolvedValue(createMockSession(userOverrides));
}

export function mockUnauthenticatedSession() {
  mockGetServerSession.mockResolvedValue(null);
}
