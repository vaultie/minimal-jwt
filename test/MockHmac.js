/*!
 * Copyright (c) 2019-2023 Digital Bazaar, Inc. All rights reserved.
 */
import * as base64url from 'base64url-universal';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);

const nodejs = (
  typeof process !== 'undefined' && process.versions && process.versions.node);

let crypto;
if(nodejs) {
  crypto = require('isomorphic-webcrypto');
} else {
  crypto = self.crypto || self.msCrypto;
}

// 'PHRoZS1iZXN0LWtlcHQtc2VjcmV0Pg' is generated by executing:
// base64url.encode(new TextEncoder().encode('<the-best-kept-secret>')
const _secret = base64url.decode('PHRoZS1iZXN0LWtlcHQtc2VjcmV0Pg');

export class MockHmac {
  constructor({id, type, algorithm, key}) {
    this.id = id;
    this.type = type;
    this.algorithm = algorithm;
    this.key = key;
  }

  static async create({data = _secret} = {}) {
    // random test data
    const id = 'urn:mockhmac:1';
    const type = 'Sha256HmacKey2019';
    const algorithm = 'HS256';
    const extractable = true;
    const key = await crypto.subtle.importKey(
      'raw', data, {name: 'HMAC', hash: {name: 'SHA-256'}}, extractable,
      ['sign', 'verify']);
    const hmac = new MockHmac({id, type, algorithm, key});
    return hmac;
  }

  async sign({data}) {
    const key = this.key;
    const signature = new Uint8Array(
      await crypto.subtle.sign(key.algorithm, key, data));
    return base64url.encode(signature);
  }

  async verify({data, signature}) {
    const key = this.key;
    return crypto.subtle.verify(key.algorithm, key, signature, data);
  }
}
