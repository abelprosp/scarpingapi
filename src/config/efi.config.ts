import { registerAs } from '@nestjs/config';

export const efiConfig = registerAs('efi', () => ({
  clientId: process.env.EFI_CLIENT_ID || '',
  clientSecret: process.env.EFI_CLIENT_SECRET || '',
  pixKey: process.env.EFI_PIX_KEY || '',
  sandbox: process.env.EFI_SANDBOX !== 'false',
  webhookSecret: process.env.EFI_WEBHOOK_SECRET || '',
  certificatePath: process.env.EFI_CERTIFICATE_PATH || '',
  pixExpirationSeconds: parseInt(process.env.EFI_PIX_EXPIRATION_SECONDS || '3600', 10),
}));

export const billingConfig = registerAs('billing', () => ({
  creditPackPriceCents: parseInt(process.env.CREDIT_PACK_PRICE_CENTS || '500', 10),
  creditPackCredits: parseInt(process.env.CREDIT_PACK_CREDITS || '500', 10),
  overageBlockCredits: parseInt(process.env.OVERAGE_BLOCK_CREDITS || '500', 10),
}));
