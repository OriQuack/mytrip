const { AES, enc } = require('crypto-js');

const encryptData = (data, key) => {
    const dataWA = enc.Utf8.parse(data);
    const keyWA = enc.Utf8.parse(key);
    const ivWA = enc.Utf8.parse(key.substring(0, 16));

    const cipher = AES.encrypt(dataWA, keyWA, { iv: ivWA });
    return cipher.ciphertext.toString(enc.Base64url);
};

const decryptData = (encData, key) => {
    const keyWA = enc.Utf8.parse(key);
    const ivWA = enc.Utf8.parse(key.substring(0, 16));

    const cipher = AES.decrypt(
        enc.Base64url.parse(encData.replace(/=/gi, '')).toString(enc.Base64),
        keyWA,
        { iv: ivWA }
    );
    return cipher.toString(enc.Utf8);
};

exports.encryptData = encryptData;
exports.decryptData = decryptData;
