import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const EfiPay = require('sdk-node-apis-efi');

export interface PixChargeResult {
  txid: string;
  qrCode: string;
  copyPaste: string;
  expiresAt: Date;
  amountCents: number;
}

@Injectable()
export class EfiService {
  private readonly logger = new Logger(EfiService.name);
  private client: InstanceType<typeof EfiPay> | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initClient();
  }

  private initClient(): void {
    const clientId = this.configService.get<string>('efi.clientId');
    const clientSecret = this.configService.get<string>('efi.clientSecret');
    const certificate = this.configService.get<string>('efi.certificatePath');

    if (!clientId || !clientSecret || clientId === 'your-client-id') {
      this.logger.warn('EFI não configurado — pagamentos PIX indisponíveis');
      return;
    }

    if (!certificate) {
      this.logger.warn('EFI_CERTIFICATE_PATH não definido — pagamentos PIX indisponíveis');
      return;
    }

    try {
      this.client = new EfiPay({
        sandbox: this.configService.get<boolean>('efi.sandbox', true),
        client_id: clientId,
        client_secret: clientSecret,
        certificate,
      });
    } catch (err) {
      this.logger.error('Falha ao inicializar SDK EFI', err);
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  generateTxid(): string {
    const suffix = randomBytes(13).toString('hex');
    return `noviq${suffix}`.slice(0, 35);
  }

  async createPixCharge(amountCents: number, description: string): Promise<PixChargeResult> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Pagamentos PIX indisponíveis. Configure EFI_CLIENT_ID, EFI_CLIENT_SECRET e EFI_CERTIFICATE_PATH.',
      );
    }

    const pixKey = this.configService.get<string>('efi.pixKey');
    if (!pixKey) {
      throw new ServiceUnavailableException('EFI_PIX_KEY não configurada');
    }

    const expiration = this.configService.get<number>('efi.pixExpirationSeconds', 3600);
    const txid = this.generateTxid();
    const amountStr = (amountCents / 100).toFixed(2);

    const charge = await this.client.pixCreateCharge(
      { txid },
      {
        calendario: { expiracao: expiration },
        valor: { original: amountStr },
        chave: pixKey,
        solicitacaoPagador: description.slice(0, 140),
      },
    );

    const locId = charge.loc?.id;
    let qrCode = '';
    let copyPaste = charge.pixCopiaECola || '';

    if (locId) {
      const qr = await this.client.pixGenerateQRCode({ id: locId });
      qrCode = qr.imagemQrcode || qr.qrcode || '';
      copyPaste = copyPaste || qr.qrcode || '';
    }

    const createdAt = charge.calendario?.criacao
      ? new Date(charge.calendario.criacao)
      : new Date();
    const expiresAt = new Date(createdAt.getTime() + expiration * 1000);

    return {
      txid: charge.txid || txid,
      qrCode,
      copyPaste,
      expiresAt,
      amountCents,
    };
  }

  async getChargeStatus(txid: string): Promise<'PENDING' | 'PAID' | 'EXPIRED'> {
    if (!this.client) {
      throw new ServiceUnavailableException('EFI não configurado');
    }

    try {
      const charge = await this.client.pixDetailCharge({ txid });
      if (charge.status === 'CONCLUIDA') return 'PAID';
      if (charge.status === 'ATIVA') return 'PENDING';
      return 'EXPIRED';
    } catch (err) {
      this.logger.warn(`Erro ao consultar cobrança PIX ${txid}`, err);
      return 'PENDING';
    }
  }
}
