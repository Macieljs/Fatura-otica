"use client";

import { identityClient } from "@/services/identityClient";
import type { Branch, CreateProfileRequest, Grant, Me, Profile, ProfileStatus } from "@/types/identity";

const grantKey = (grant: Pick<Grant, "role" | "scope" | "branchId">) =>
  `${grant.role}:${grant.scope}:${grant.scope === "branch" ? grant.branchId : ""}`;

export const identityService = {
  async getBranches(): Promise<Branch[]> {
    return identityClient.request("identityListBranches");
  },
  async getUsers(): Promise<{ profiles: Profile[]; grantsMap: Record<string, Grant[]> }> {
    return identityClient.request("identityListUsers");
  },
  async createProfile({ name, email, branchId }: CreateProfileRequest): Promise<Profile> {
    return identityClient.request("identityCreatePendingProfile", { name: name.trim(), email: email.trim(), branchId });
  },
  async updateUserGrants(userId: string, desired: Grant[]): Promise<Grant[]> {
    const { grantsMap } = await identityService.getUsers();
    const current = grantsMap[userId] ?? [];
    const desiredKeys = new Set(desired.map(grantKey));
    const currentKeys = new Set(current.map(grantKey));
    try {
      for (const grant of desired) {
        if (!currentKeys.has(grantKey(grant))) {
          await identityClient.request("identityGrantAccess", {
            role: grant.role, scope: grant.scope,
            ...(grant.scope === "branch" ? { branchId: grant.branchId } : {}),
          }, { userId });
          currentKeys.add(grantKey(grant));
        }
      }
      for (const grant of current) {
        if (!desiredKeys.has(grantKey(grant))) {
          await identityClient.request("identityRevokeAccess", undefined, { userId, grantId: grant.id });
        }
      }
    } catch (error) {
      // Refresh authoritative state after a potentially partially applied sequence.
      await identityService.getUsers().catch(() => undefined);
      throw error;
    }
    return (await identityService.getUsers()).grantsMap[userId] ?? [];
  },
  async updateUserStatus(userId: string, status: ProfileStatus): Promise<ProfileStatus> {
    if (status === "pending") throw new Error("Não é possível retornar uma conta para pendente.");
    return (await identityClient.request("identitySetUserStatus", { status }, { userId })).status;
  },
  async resendActivation(userId: string): Promise<{ token: string; expiresAt: string }> {
    return identityClient.request("identityIssueActivation", undefined, { userId });
  },
  async activateAccount(token: string, password: string, name = ""): Promise<void> {
    await identityClient.completeActivation({ token, password, name });
  },
  async getMe(): Promise<Me> {
    return identityClient.request("identityGetMe");
  },
  async setActiveBranch(branchId: string): Promise<string> {
    await identityClient.selectBranch(branchId);
    return branchId;
  },
};
