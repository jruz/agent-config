export type PullErrorCode = "dirty-targets";

export type PullFailure = Readonly<{
  code: PullErrorCode;
  paths: readonly string[];
}>;

export type PullResult =
  | Readonly<{ success: true; data: readonly string[] }>
  | Readonly<{ success: false; error: PullFailure }>;
