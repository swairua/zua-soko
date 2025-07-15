declare module "jsonwebtoken" {
  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string,
    options?: object
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: string,
    options?: object
  ): any;

  export function decode(token: string, options?: object): null | { [key: string]: any };
}
