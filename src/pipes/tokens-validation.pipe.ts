import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Token } from '../modules/tokens/tokens.entity';
import { TokensService } from '../modules/tokens/tokens.service';

@Injectable()
export class TokensValidationPipe implements PipeTransform {
  constructor(private tokensService: TokensService) {}
  async transform(data: {
    token: string;
  }): Promise<TokensValidationPipeOutput> {
    try {
      const bearer: string = data.token;
      const tokenString = bearer.split('Bearer ')[1];
      const token = await this.tokensService.verifyToken(tokenString);
      if (!token) {
        throw new Error();
      }
      return { ...data, token };
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }
}

export interface TokensValidationPipeOutput {
  token: Token;
}
