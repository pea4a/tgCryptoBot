import React, { useState } from 'react';
import { Typography, Button } from '@mui/material';


const App = () => {
  const [publicKeyPem, setPublicKeyPem] = useState('');
  const [privateKeyPem, setPrivateKeyPem] = useState('');
  const [message, setMessage] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');

  const generateKeys = async () => {
    const keys = await generateKeyPair();
    const publicKeyPem = await exportKey(keys.publicKey, 'publicKey');
    const privateKeyPem = await exportKey(keys.privateKey, 'privateKey');

    setPublicKeyPem(publicKeyPem);
    setPrivateKeyPem(privateKeyPem);
  };

  const handleEncrypt = async () => {
    const publicKey = await importKey(publicKeyPem, 'publicKey');
    const { encryptedMessage, encryptedSymmetricKey } = await encryptMessage(publicKey, message);
    setEncryptedMessage(JSON.stringify({
      encryptedMessage: arrayBufferToBase64(encryptedMessage),
      encryptedSymmetricKey: arrayBufferToBase64(encryptedSymmetricKey)
    }));
  };

  const handleDecrypt = async () => {
    const privateKey = await importKey(privateKeyPem, 'privateKey');
    const { encryptedMessage: encMessage, encryptedSymmetricKey: encSymKey } = JSON.parse(encryptedMessage);
    const encryptedArrayBuffer = base64ToArrayBuffer(encMessage);
    const encryptedSymmetricKey = base64ToArrayBuffer(encSymKey);
    const decrypted = await decryptMessage(privateKey, encryptedArrayBuffer, encryptedSymmetricKey);
    setDecryptedMessage(decrypted);
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const base64ToArrayBuffer = (base64) => {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const exportKey = async (key, type) => {
    const exported = await window.crypto.subtle.exportKey(
      type === 'publicKey' ? 'spki' : 'pkcs8',
      key
    );
    return `-----BEGIN ${type === 'publicKey' ? 'PUBLIC' : 'PRIVATE'} KEY-----\n${arrayBufferToBase64(exported)}\n-----END ${type === 'publicKey' ? 'PUBLIC' : 'PRIVATE'} KEY-----`;
  };

  const importKey = async (pem, type) => {
    const binaryDerString = window.atob(pem.replace(/(-----(BEGIN|END) (PUBLIC|PRIVATE) KEY-----|\n)/g, ''));
    const binaryDer = new Uint8Array([...binaryDerString].map(char => char.charCodeAt(0)));
    
    return window.crypto.subtle.importKey(
      type === 'publicKey' ? 'spki' : 'pkcs8',
      binaryDer.buffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      true,
      [type === 'publicKey' ? 'encrypt' : 'decrypt']
    );
  };

  const generateSymmetricKey = async () => {
    return window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
  };

  const encryptMessage = async (publicKey, message) => {
    const symmetricKey = await generateSymmetricKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    const encryptedMessage = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(12) // Initialization vector
      },
      symmetricKey,
      data
    );

    const exportedSymmetricKey = await window.crypto.subtle.exportKey("raw", symmetricKey);
    const encryptedSymmetricKey = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      publicKey,
      exportedSymmetricKey
    );

    return { encryptedMessage, encryptedSymmetricKey };
  };

  const decryptMessage = async (privateKey, encryptedMessage, encryptedSymmetricKey) => {
    const decryptedSymmetricKey = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP"
      },
      privateKey,
      encryptedSymmetricKey
    );

    const symmetricKey = await window.crypto.subtle.importKey(
      "raw",
      decryptedSymmetricKey,
      {
        name: "AES-GCM"
      },
      false,
      ["decrypt"]
    );

    const decryptedMessage = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(12) // Initialization vector
      },
      symmetricKey,
      encryptedMessage
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedMessage);
  };

  return (
    <div>
      <Button onClick={generateKeys}>Generate Key Pair</Button>
      <div>
        <textarea
          placeholder="Public Key"
          value={publicKeyPem}
          onChange={(e) => setPublicKeyPem(e.target.value)}
        ></textarea>
        <textarea
          placeholder="Private Key"
          value={privateKeyPem}
          onChange={(e) => setPrivateKeyPem(e.target.value)}
        ></textarea>
        <textarea
          placeholder="Enter message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>
        <Button onClick={handleEncrypt}>Encrypt Message</Button>
      </div>
      <div>
        <textarea
          placeholder="Encrypted Message"
          value={encryptedMessage}
          onChange={(e) => setEncryptedMessage(e.target.value)}
        ></textarea>
        <Button onClick={handleDecrypt}>Decrypt Message</Button>
        {decryptedMessage && <div>Decrypted Message: {decryptedMessage}</div>}
      </div>
    </div>
  );
};

async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey({
    name: "RSA-OAEP",
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    hash: { name: "SHA-256" }
  },
  true,
  ["encrypt", "decrypt"]);

  return keyPair;
}

export default App;
