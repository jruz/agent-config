export type Finding = Readonly<{
  path: string;
  status: "matching" | "missing" | "changed" | "review";
  expected: string;
  actual: string | null;
}>;
