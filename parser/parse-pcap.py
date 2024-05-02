import pyshark

def parse_pcap(file_path):
    cap = None
    try:
        cap = pyshark.FileCapture(file_path, keep_packets=False)
        parsed_data = []
        for packet in cap:
            try:
                # Basic TCP information
                tcp_layer = packet.tcp
                packet_info = {
                    "protocol": "TCP",
                    "src_addr": packet.ip.src,
                    "dst_addr": packet.ip.dst,
                    "src_port": tcp_layer.srcport,
                    "dst_port": tcp_layer.dstport,
                }

                # Check if the packet contains HTTP layer
                if 'HTTP' in packet.layers:
                    print("HTTP packet")
                    http_layer = packet.http
                    # Add HTTP specific information
                    packet_info.update({
                        "http_method": getattr(http_layer, 'request_method', None),
                        "http_host": getattr(http_layer, 'host', None),
                        "http_uri": getattr(http_layer, 'request_uri', None),
                    })

                # Append the combined information to the results list
                parsed_data.append(packet_info)
            except AttributeError:
                continue  # Skip packets that cause issues
            except Exception as e:
                # print(f"Error processing packet: {e}")
                continue
    except Exception as e:
        # print(f"Error reading pcap file: {e}")
        return parsed_data
    finally:
        if cap:
            cap.close()
        return parsed_data

if __name__ == "__main__":
    data = parse_pcap("../captures/proxy_traffic.pcap")
    # for i in data:
    #     print(i)
    print('Complete!')