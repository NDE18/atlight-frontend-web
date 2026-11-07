import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Sans `globals`, Testing Library ne démonte pas tout seul les rendus entre deux tests.
afterEach(cleanup);
