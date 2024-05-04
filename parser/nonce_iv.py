import pyshark

def extract_nonce_and_data(pcap_file):
    cap = pyshark.FileCapture(pcap_file, display_filter='tls')
    for packet in cap:
        try:
            if 'TLS' in packet:
                # Check if it's an Application Data packet
                if packet.tls.record_content_type == '23':  # Application data type
                    # This is where you'd look for nonce, depending on how it's used in your cipher
                    # For some ciphers, this might be in packet.tls.record_iv (if available)
                    print("Encrypted Application Data found:")
                    if hasattr(packet.tls, 'record_iv'):
                        print("IV/Nonce:", packet.tls.record_iv)
                    if hasattr(packet.tls, 'app_data'):
                        print("Encrypted Data:", packet.tls.app_data)
        except AttributeError as e:
            continue

# Usage
pcap_path = '../proxy-keys/proxy_traffic.pcap'
extract_nonce_and_data(pcap_path)