import CryptoJS from "crypto-js";
import Pako from "pako";

const key =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "12345678901234567890123456789012";
const iv = CryptoJS.enc.Utf8.parse("1234567890123456");

export const handleEncrypt = (data: object) => {
  const json = JSON.stringify(data);
  const compressed = Pako.deflate(json, { level: 9 });
  const base64Compressed = btoa(String.fromCharCode(...compressed));

  // Encrypt without salt (smaller output)
  const encrypted = CryptoJS.AES.encrypt(
    base64Compressed,
    CryptoJS.enc.Utf8.parse(key),
    { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
  ).ciphertext.toString(CryptoJS.enc.Base64);

  return encrypted;
};

export const decryptPayload = (encrypted: string) => {
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.enc.Base64.parse(encrypted) } as any,
    CryptoJS.enc.Utf8.parse(key),
    { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
  );

  const base64Compressed = decrypted.toString(CryptoJS.enc.Utf8);
  const compressedData = Uint8Array.from(atob(base64Compressed), (c) =>
    c.charCodeAt(0)
  );
  const decompressed = Pako.inflate(compressedData, { to: "string" });

  return JSON.parse(decompressed);
};
