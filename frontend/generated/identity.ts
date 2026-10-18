// Generated from backend/docs/contracts/identity.openapi.yaml. Run npm run generate:identity.
export type Schemas = {
  "LoginRequest": { "email": string; "password": string; };
  "ActivationRequest": { "token": string; "password": string; "name": string; };
  "CreateProfileRequest": { "email": string; "name": string; "branchId": string; };
  "BranchSelectionRequest": { "branchId": string; };
  "GrantRequest": { "role": "seller" | "branchManager" | "owner" | "accessAdministrator"; "scope": "tenant" | "branch"; "branchId"?: string; };
  "UserStateRequest": { "status": "active" | "blocked"; };
  "Branch": { "id": string; "name": string; };
  "Grant": { "id": string; "role": "seller" | "branchManager" | "owner" | "accessAdministrator"; "scope": "tenant" | "branch"; "branchId"?: string; };
  "Profile": { "id": string; "name": string; "email": string; "status": "pending" | "active" | "blocked"; };
  "Me": { "profile": Schemas["Profile"]; "branches": Array<Schemas["Branch"]>; "tenantRoles": Array<"seller" | "branchManager" | "owner" | "accessAdministrator">; "grants": Array<Schemas["Grant"]>; "activeBranchId": string | null; };
  "Session": { "accessToken": string; "expiresIn": 900; "tokenType": "Bearer"; "me": Schemas["Me"]; };
  "Problem": { "type": string; "title": string; "status": number; "detail"?: string; "traceId": string; "code": string; "errors"?: { [key: string]: Array<string>; }; };
  "CsrfToken": { "csrfToken": string; };
  "ActivationSecret": { "token": string; "expiresAt": string; };
  "DirectoryProfile": { "id": string; "name": string; "email": string; "status": "pending" | "active" | "blocked"; "branchId": string | null; };
  "UsersDirectory": { "profiles": Array<Schemas["DirectoryProfile"]>; "grantsMap": { [key: string]: Array<Schemas["Grant"]>; }; };
};
export type IdentityOperations = {
  "identityLogin": { body: Schemas["LoginRequest"]; response: Schemas["Session"]; path: Record<string, never> };
  "identityRefresh": { body: undefined; response: Schemas["Session"]; path: Record<string, never> };
  "identityLogout": { body: undefined; response: void; path: Record<string, never> };
  "identityCompleteActivation": { body: Schemas["ActivationRequest"]; response: void; path: Record<string, never> };
  "identityGetMe": { body: undefined; response: Schemas["Me"]; path: Record<string, never> };
  "identitySelectBranch": { body: Schemas["BranchSelectionRequest"]; response: Schemas["Me"]; path: Record<string, never> };
  "identityCreatePendingProfile": { body: Schemas["CreateProfileRequest"]; response: Schemas["Profile"]; path: Record<string, never> };
  "identityListUsers": { body: undefined; response: Schemas["UsersDirectory"]; path: Record<string, never> };
  "identityGrantAccess": { body: Schemas["GrantRequest"]; response: Schemas["Grant"]; path: { "userId": string } };
  "identityRevokeAccess": { body: undefined; response: void; path: { "userId": string; "grantId": string } };
  "identityIssueActivation": { body: undefined; response: Schemas["ActivationSecret"]; path: { "userId": string } };
  "identitySetUserStatus": { body: Schemas["UserStateRequest"]; response: Schemas["Profile"]; path: { "userId": string } };
  "identityGetCsrfToken": { body: undefined; response: Schemas["CsrfToken"]; path: Record<string, never> };
  "identityListBranches": { body: undefined; response: Array<Schemas["Branch"]>; path: Record<string, never> };
};
export const identityOperations = {
  "identityLogin": {
    "method": "POST",
    "path": "/api/v1/identity/login"
  },
  "identityRefresh": {
    "method": "POST",
    "path": "/api/v1/identity/refresh"
  },
  "identityLogout": {
    "method": "POST",
    "path": "/api/v1/identity/logout"
  },
  "identityCompleteActivation": {
    "method": "POST",
    "path": "/api/v1/identity/activation/complete"
  },
  "identityGetMe": {
    "method": "GET",
    "path": "/api/v1/identity/me"
  },
  "identitySelectBranch": {
    "method": "PUT",
    "path": "/api/v1/identity/me/branch"
  },
  "identityCreatePendingProfile": {
    "method": "POST",
    "path": "/api/v1/identity/users"
  },
  "identityListUsers": {
    "method": "GET",
    "path": "/api/v1/identity/users"
  },
  "identityGrantAccess": {
    "method": "POST",
    "path": "/api/v1/identity/users/{userId}/grants"
  },
  "identityRevokeAccess": {
    "method": "DELETE",
    "path": "/api/v1/identity/users/{userId}/grants/{grantId}"
  },
  "identityIssueActivation": {
    "method": "POST",
    "path": "/api/v1/identity/users/{userId}/activation"
  },
  "identitySetUserStatus": {
    "method": "PUT",
    "path": "/api/v1/identity/users/{userId}/status"
  },
  "identityGetCsrfToken": {
    "method": "GET",
    "path": "/api/v1/identity/csrf"
  },
  "identityListBranches": {
    "method": "GET",
    "path": "/api/v1/identity/branches"
  }
} as const;
