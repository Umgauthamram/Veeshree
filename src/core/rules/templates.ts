export const RULE_START_MARKER = "<!-- veeshree:start -->";
export const RULE_END_MARKER = "<!-- veeshree:end -->";

export function generateVeeshreeAgentRuleBlock(): string {
  return `${RULE_START_MARKER}
## Veeshree Model-Independent Memory Guidelines
This repository utilizes **Veeshree** for persistent context across developer sessions and AI agents.

### When MCP Tools are Available:
1. Always call \`get_context()\` before proposing changes to inspect active goals and constraints.
2. Check \`check_drift()\` to verify if any linked code files have drifted from recorded ADRs.
3. Propose new architectural decisions using \`propose_decision(...)\`.
4. Add or check off tasks using \`update_task(name, action)\`.

### When Operating Offline or via File Access:
1. **Architectural Constraints**: Strictly follow all rules in \`docs/memory/constraints.md\`.
2. **Current Milestones**: Read \`docs/memory/current-state.md\` and \`docs/memory/tasks.md\` for active tasks and focus.
3. **Decision Records**: Check \`docs/memory/decisions/\` before making significant structural modifications.
4. **Negative Knowledge**: Never implement or recommend approaches documented in \`docs/memory/rejected.md\`.
5. **Session Progress**: After finishing tasks, update \`docs/memory/current-state.md\` and check off items in \`docs/memory/tasks.md\`.
${RULE_END_MARKER}`;
}
