# from cryptography.hazmat.primitives.ciphers.aead import AESGCM
# from cryptography.hazmat.primitives import hashes
# from cryptography.hazmat.primitives.kdf.hkdf import HKDF
# from cryptography.hazmat.backends import default_backend

# def hkdf_expand_label(secret, label, context, length):
#     label_bytes = b"tls13 " + label
#     context_bytes = context
#     length_bytes = length.to_bytes(2, byteorder='big')
#     info = label_bytes + b"\0" + context_bytes + length_bytes

#     hkdf = HKDF(
#         algorithm=hashes.SHA384(),
#         length=length,
#         salt=None,
#         info=info,
#         backend=default_backend()
#     )
#     return hkdf.derive(secret)

# # SERVER_TRAFFIC_SECRET_0 (replace with the actual value from the key log file)
# server_traffic_secret_0 = bytes.fromhex("51fbf918b26dedad7570342e817da826efef1a52a21203e0286908032bc96ff91fd56428cf0a0d4c60ef97b785f39c28")

# # Encrypted payload (replace with the actual encrypted payload)
# encrypted_payload = bytes.fromhex("17030300b8602bffff9be1545f6a90d331489648cda8217588082fa58151bfe30b6d3f6b0017190f8ae2281400732f5407e82a2268c6f51d80813a385823cc11ef5c05b339cd0084490d0b26e3f3f0ca180065bf5692e10f8bea70e816d3589a9ce098361195d7bce11fed9bcea902704bd1760670d021dedb2e4ad65099a9a3a646db221328d37691d9bd184f8a702496bb40c4e5e395dcf345730d732b9a5ed6c9b462cfeb17da9d6feec456f8c537a1ed49b3aea1c4f6dd92cae75e")

# # Derive the encryption key and IV (example using HKDF for TLS_AES_256_GCM_SHA384)
# # You'll need to implement the HKDF function separately
# encryption_key = hkdf_expand_label(server_traffic_secret_0, b"key", b"", 32)
# iv = hkdf_expand_label(server_traffic_secret_0, b"iv", b"", 12)

# # Decrypt the payload
# aesgcm = AESGCM(encryption_key)
# decrypted_payload = aesgcm.decrypt(iv, encrypted_payload, None)

# print(decrypted_payload.decode("utf-8"))

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend
import binascii

def decrypt_tls13_aes_gcm(key_hex, nonce_hex, encrypted_data_hex, associated_data_hex):
    # Convert hex to bytes
    key = binascii.unhexlify(key_hex)
    nonce = binascii.unhexlify(nonce_hex)
    encrypted_data = binascii.unhexlify(encrypted_data_hex)
    associated_data = binascii.unhexlify(associated_data_hex)

    # Initialize AES-GCM with the key and nonce
    aesgcm = AESGCM(key)
    
    # Decrypt the data
    try:
        decrypted_data = aesgcm.decrypt(nonce, encrypted_data, associated_data)
        print("Decrypted data:", decrypted_data.decode('utf-8'))
    except Exception as e:
        print("Decryption failed:", str(e))

# Example usage
key_hex = bytes.fromhex("51fbf918b26dedad7570342e817da826efef1a52a21203e0286908032bc96ff91fd56428cf0a0d4c60ef97b785f39c28")
nonce_hex = 'YOUR_NONCE_HEX'
encrypted_data_hex = bytes.fromhex("17030300b8602bffff9be1545f6a90d331489648cda8217588082fa58151bfe30b6d3f6b0017190f8ae2281400732f5407e82a2268c6f51d80813a385823cc11ef5c05b339cd0084490d0b26e3f3f0ca180065bf5692e10f8bea70e816d3589a9ce098361195d7bce11fed9bcea902704bd1760670d021dedb2e4ad65099a9a3a646db221328d37691d9bd184f8a702496bb40c4e5e395dcf345730d732b9a5ed6c9b462cfeb17da9d6feec456f8c537a1ed49b3aea1c4f6dd92cae75e")
associated_data_hex = 'YOUR_ASSOCIATED_DATA_HEX'  # Often this is the additional authenticated data (AAD)

decrypt_tls13_aes_gcm(key_hex, nonce_hex, encrypted_data_hex, associated_data_hex)
