
---
name: demo-validation
description: Validate an OperateFlow demo screen or feature after implementation, including build checks, simulation consistency, and interaction coverage.
---

# OperateFlow Demo Validation

Use this skill after implementing or modifying a demo feature.

## Workflow

1. Identify the feature and approved acceptance criteria.
2. Review the relevant implementation files.
3. Confirm the feature uses the agreed personas and fictional data.
4. Check that lifecycle, workflow status, and delivery health are handled consistently.
5. Confirm simulated external actions are clearly labeled.
6. Verify buttons, forms, navigation, and state transitions.
7. Check that no real external API calls or credentials were introduced.
8. Run the available lint and build checks from `app/`.
9. Report:
   - Checks passed
   - Issues found
   - Items requiring manual browser verification
   - Any remaining limitations

## Constraints

- Do not add features while validating.
- Do not silently refactor unrelated code.
- Do not claim a browser interaction passed unless it was actually tested.
- Ask for approval before making substantial fixes.
- Never commit or push automatically.
