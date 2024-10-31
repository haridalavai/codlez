export interface CurrentUser {
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  nbf: number;
  org_id: string;
  org_role: string;
  org_slug: string;
  sub: string;
  user_email_verified: boolean;
  user_full_name: string;
  user_id: string;
  user_metadata: Record<string, any>;
}
