export interface Plan {
  id: string;
  name: string;
  displayName: string;
  creditsPerMonth: number;
  priceYen: number;
  description: string | null;
  sortOrder: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserCredits {
  id: string;
  userId: string;
  credits: number;
  planId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Better Auth 必須テーブル
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: number;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  userId: string;
  accountId: string;
  providerId: string;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  scope: string | null;
  idToken: string | null;
  password: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Verification {
  id: string;
  identifier: string;
  value: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  style: string;
  aspectRatio: string;
  category: string;
  previewImageUrl: string | null;
  promptTemplate: string | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedImage {
  id: string;
  userId: string;
  r2Key: string;
  prompt: string;
  templateId: string | null;
  aspectRatio: string;
  width: number;
  height: number;
  creditsUsed: number;
  createdAt: string;
}

export interface PromptHistory {
  id: string;
  userId: string;
  catchCopy: string | null;
  prompt: string;
  createdAt: string;
}

export interface Database {
  user: User;
  session: Session;
  account: Account;
  verification: Verification;
  plan: Plan;
  user_credits: UserCredits;
  template: Template;
  generated_image: GeneratedImage;
  prompt_history: PromptHistory;
}
