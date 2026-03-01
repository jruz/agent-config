import { existsSync, readFileSync, writeFileSync } from "node:fs";

type PlanFrontmatter = {
  active_loop: boolean;
  iteration: number;
  max_iterations: number;
};

function parseFrontmatter(content: string): PlanFrontmatter | null {
  const lines = content.split("\n");

  if (lines[0] !== "---") {
    return null;
  }

  const endIdx = lines.indexOf("---", 1);
  if (endIdx === -1) {
    return null;
  }

  const frontmatterLines = lines.slice(1, endIdx);
  const result: PlanFrontmatter = {
    active_loop: false,
    iteration: 1,
    max_iterations: 20,
  };

  frontmatterLines.reduce((acc, line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) return acc;

    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();

    if (key === "active_loop") acc.active_loop = value === "true";
    else if (key === "iteration") acc.iteration = parseInt(value);
    else if (key === "max_iterations") acc.max_iterations = parseInt(value);

    return acc;
  }, result);

  return result;
}

function updatePlanIteration(content: string, newIteration: number): boolean {
  try {
    const updated = content.replace(
      /iteration: \d+/,
      `iteration: ${newIteration}`,
    );
    writeFileSync("PLAN.md", updated);
    return true;
  } catch {
    return false;
  }
}

function setPlanLoopInactive(content: string): boolean {
  try {
    const updated = content.replace("active_loop: true", "active_loop: false");
    writeFileSync("PLAN.md", updated);
    return true;
  } catch {
    return false;
  }
}

function getUncheckedAcceptanceCriteria(content: string): string[] {
  if (!content.includes("## Acceptance Criteria")) {
    return [];
  }

  const lines = content.split("\n");
  const acIdx = lines.findIndex((l) => l.startsWith("## Acceptance Criteria"));
  if (acIdx === -1) return [];

  const sectionEnd = lines.findIndex(
    (l, i) => i > acIdx && l.startsWith("## "),
  );
  const sectionLines = lines.slice(
    acIdx + 1,
    sectionEnd === -1 ? undefined : sectionEnd,
  );

  return sectionLines
    .filter((l) => l.startsWith("- [ ]"))
    .map((l) => l.replace("- [ ] ", ""));
}

function main() {
  if (!existsSync("PLAN.md")) {
    return;
  }

  let content: string;
  try {
    content = readFileSync("PLAN.md", "utf-8");
  } catch {
    console.error("stop_plan: failed to read PLAN.md");
    return;
  }

  const frontmatter = parseFrontmatter(content);

  if (!frontmatter?.active_loop) {
    return;
  }

  const unchecked = getUncheckedAcceptanceCriteria(content);

  if (unchecked.length === 0) {
    console.error(`Plan complete at iteration ${frontmatter.iteration}`);
    setPlanLoopInactive(content);
    return;
  }

  if (frontmatter.iteration >= frontmatter.max_iterations) {
    console.error(
      `Plan loop: Max iterations (${frontmatter.max_iterations}) reached`,
    );
    setPlanLoopInactive(content);
    return;
  }

  const nextIteration = frontmatter.iteration + 1;
  if (!updatePlanIteration(content, nextIteration)) {
    console.error("stop_plan: failed to update PLAN.md iteration");
    return;
  }

  const criteriaList = unchecked.map((c) => `  - ${c}`).join("\n");

  console.log(
    JSON.stringify({
      decision: "block",
      reason: `Continue working on PLAN.md. Unchecked acceptance criteria:\n${criteriaList}\n\nBefore continuing, add a Loop Log entry: \`- **Loop ${frontmatter.iteration}**: [What you tried] → [Outcome]\``,
      systemMessage: `Loop ${nextIteration}/${frontmatter.max_iterations} | Update Loop Log, then continue on acceptance criteria`,
    }),
  );
}

main();
