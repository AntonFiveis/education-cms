import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { Token } from './tokens.entity';
import { TokenDto } from './dto/token.dto';

@Controller('tokens')
export class TokensController {
  constructor(private tokensService: TokensService) {}

  @Get('/:token')
  async getToken(@Param('token') jwttoken: string): Promise<Token | void> {
    return this.tokensService.verifyToken(jwttoken);
  }

  @Post()
  async postToken(@Body() token: TokenDto): Promise<void> {
    this.tokensService.postToken(token);
  }
}
