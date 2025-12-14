import CryptoJS from "crypto-js";

//just to ensure data not depended on query and can be changed
const key =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "12345678901234567890123456789012";

export const handleEncrypt = (data: object) => {
  const json = JSON.stringify(data);

  // Encrypt data
  const encrypted = CryptoJS.AES.encrypt(json, key).toString();

  return encrypted;
};

export const decryptPayload = (encrypted: string) => {
  const bytes = CryptoJS.AES.decrypt(encrypted, key);
  const decryptedJSON = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedJSON);
};
