/**
 * Role hierarchy (high → low), confirmed with the product owner:
 *
 *   Boss > SuperAdmin > Admin > Customer
 *
 * A user may assign or remove only roles ranked **strictly below** their own
 * highest role. The backend enforces this; the UI mirrors it so the role picker
 * only offers roles the current user can actually grant. Lookups are
 * case-insensitive, and unknown roles rank lowest (0 → not manageable).
 */
const RANK_BY_NAME: Record<string, number> = {
  boss: 4,
  superadmin: 3,
  admin: 2,
  customer: 1,
};

/** Numeric rank of a single role name (0 for unknown roles). */
export function roleRank(name: string): number {
  return RANK_BY_NAME[name.trim().toLowerCase()] ?? 0;
}

/** Highest rank among a set of role names (0 if none are recognised). */
export function highestRoleRank(roleNames: readonly string[]): number {
  return roleNames.reduce((max, name) => Math.max(max, roleRank(name)), 0);
}

/**
 * A user's effective role — the single highest-ranked one they hold. Roles are
 * cumulative (a higher role implies the lower ones), so this one role represents
 * the user's whole level. Returns `null` when the user has no recognised role.
 */
export function primaryRole(roleNames: readonly string[]): string | null {
  let best: string | null = null;
  let bestRank = -1;
  for (const name of roleNames) {
    const rank = roleRank(name);
    if (rank > bestRank) {
      bestRank = rank;
      best = name;
    }
  }
  return best;
}

/**
 * Whether a user holding `assignerRoles` may assign or remove `targetRole`
 * (the strictly-lower rule above). Unknown target roles are never manageable.
 */
export function canManageRole(assignerRoles: readonly string[], targetRole: string): boolean {
  const target = roleRank(targetRole);
  if (target === 0) return false;
  return highestRoleRank(assignerRoles) > target;
}
