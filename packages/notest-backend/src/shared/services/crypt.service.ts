import { Injectable } from '@nestjs/common';
import Hashids from '../functions/hash-id.function';

const sha512 = require('js-sha512');

/**
 * Provide hashing of passwords using SHA 512
 *
 * You can pass a secret to be used in the constructor or directly on the method
 *
 *
 * @example
 *
 * // returns the hashed password
 * const hash = cryptService.hash("my-pwd")
 *
 * cryptService.check("my-pwd", hash) //true
 *
 */
@Injectable()
export class CryptService {
  private hashid: Hashids;

  constructor(private secret = '') {
    this.hashid = new Hashids(secret, 6, 'abcdefghijklmnopqrstuvwxyz');
  }

  generateRandomPassword(input = () => Math.round(Math.random() * Date.now())) {
    const pwdGen1 = new Hashids(this.secret, 8, 'abcdefghijklmnopqrstuvwxyz1234567890');
    const pwdGen2 = new Hashids(
      this.secret,
      8,
      '234lgh4lkj3g4123l4hjgl21l34kj32h41l4k3j645hl67k57jgh5kg76j6f9hg6df87fd9'
    );
    return pwdGen1.encode(input()) + '@' + pwdGen2.encode(input());
  }

  /**
   * Encodes a number to string. Ex. to hide the id of users
   * @param input
   */
  encode(input: number): string {
    return this.hashid.encode(input);
  }

  /**
   * Decodes an encoded string back to its number. Ex. to hide the id of users
   * @param input
   */
  decode(input: string): number {
    return this.hashid.decode(input)[0] as number;
  }

  /**
   *
   * @param rawPassword
   * @param secret (optional)
   *
   * @example
   *
   * // returns the hashed password
   * const hash = cryptService.hash("my-pwd")
   */
  hash(rawPassword: string, secret: string = ''): string {
    const s = secret || this.secret;
    return sha512(rawPassword + s);
  }

  /**
   *
   * @param rawPassword
   * @param hash
   * @param secret (optional)
   *
   * @example
   * cryptService.check("my-pwd", hash) //returns true if hashes match
   */
  check(rawPassword: string, hash, secret: string = ''): boolean {
    const s = secret || this.secret;
    return sha512(rawPassword + s) == hash;
  }
}
