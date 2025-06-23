import CryptoJS from "crypto-js";

const secretKey = import.meta.env.VITE_SECRET_KEY;

if (!secretKey) {
  console.error("Secret key is not defined in .env");
}

export const encryptId = (id) => {
  if (!id) {
    console.error("ID is missing");
    return "";
  }
  return CryptoJS.AES.encrypt(id.toString(), secretKey).toString();
};

export const decryptId = (encryptedId) => {
  try {
    if (!encryptedId) {
      console.error("Encrypted ID is missing");
      return "";
    }
    // if (!encryptedId) {
    //   console.error("Decryption failed for ID:", id);
    //   toast({
    //     title: "Invalid Link",
    //     description:
    //       "The provided ID could not be encryptedId. It may be corrupted.",
    //     variant: "destructive",
    //   });
    //   return null;
    // }
    const bytes = CryptoJS.AES.decrypt(encryptedId, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption Error:", error);
    return "";
  }
};
