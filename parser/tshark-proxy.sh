# tshark -r ../captures/proxy_traffic.pcap \
# -Y "ssl.handshake.type == 1 || ssl.handshake.type == 2" \
# -T fields \
# -e ip.src \
# -e ip.dst \
# -e tcp.srcport \
# -e tcp.dstport \
# -e ssl.handshake.version \
# -e ssl.handshake.type \
# -e ssl.handshake.ciphersuite \
# -e ssl.handshake.random \
# -o ssl.keylog_file:../keys.log


# tshark -r ../captures/proxy_traffic.pcap \
#   -Y "tcp" \
#   -T fields \
#   -e ip.src \
#   -e ip.dst \
#   -e ssl.handshake.random \
#   -e tcp.srcport \
#   -e tcp.dstport \
#   -e tcp.payload \
#   -e data \
#   -o ssl.keylog_file:../keys.log \



# tshark -r ../captures/proxy_traffic.pcap \
#   -Y "tls.handshake.type == 1 || tls.handshake.type == 2 || tcp" \
#   -T fields \
#   -e ip.src \
#   -e ip.dst \
#   -e tcp.srcport \
#   -e tcp.dstport \
#   -e tls.handshake.type \
#   -e tls.handshake.version \
#   -e tls.handshake.random \
#   -e tls.handshake.ciphersuite \
#   -e tcp.payload \
#   -o tls.keylog_file:../keys.log

tshark -r ../captures/proxy_traffic.pcap -Y "tls" -T fields -e tls.record.sequence
