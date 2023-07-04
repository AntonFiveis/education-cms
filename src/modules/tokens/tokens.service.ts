import { Injectable } from '@nestjs/common';
import { PgService } from '../pg/pg.service';
import { Token } from './tokens.entity';
import { v4 as uuid } from 'uuid';
import { TokenDto } from './dto/token.dto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokensService {
  constructor(private pgService: PgService) {}
  private addFunction = 'AddToken';
  private deleteFunction = 'DeleteToken';

  async getToken(token: string): Promise<Token> {
    return await this.pgService.findOne<Token>({
      tableName: Token.tableName,
      where: { token },
    });
  }

  async postToken({ userID }: TokenDto): Promise<Token> {
    const value = this.generateToken(userID);
    const { token, tokenID } = value;
    await this.pgService.useQuery(
      `SELECT "${this.addFunction}" ('${tokenID}', '${token}', ${userID});`,
    );
    // await this.pgService.create<Token>({tableName:Token.tableName,values:[{userID, token, tokenID}]})
    return { ...value, userID };
  }

  generateToken(userID: number): { token: string; tokenID: string } {
    const token = this.generateTokenString({ userID });
    const tokenID = uuid();
    return { token, tokenID };
  }
  generateTokenString({ userID }: TokenDto): string {
    return jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '24h' });
  }

  async verifyToken(jwttoken: string): Promise<Token | void> {
    try {
      jwt.verify(jwttoken, process.env.JWT_SECRET);
      return await this.getToken(jwttoken);
    } catch (err) {
      this.deleteToken(jwttoken);
    }
  }

  async deleteToken(tokenStr: string): Promise<void> {
    this.pgService.useQuery(`SELECT "${this.deleteFunction}" ('${tokenStr}')`);
  }
}
