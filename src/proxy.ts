// src/proxy.ts
import * as net from 'net';

const TARGET_HOST = 'server'; // Host where your server is running
const TARGET_PORT = 3000;        // Port on which your server is listening
const PROXY_PORT = 8000;         // Port on which the proxy will listen

const server = net.createServer(clientSocket => {
    console.log('Client connected to proxy');

    // Establish a connection to the target server
    const serverSocket = net.connect({
        host: TARGET_HOST,
        port: TARGET_PORT
    }, () => {
        console.log('Proxy connected to server');

        // Pipe the client socket to the server socket and vice versa
        clientSocket.pipe(serverSocket);
        serverSocket.pipe(clientSocket);
    });

    serverSocket.on('data', (data) => {
        console.log('Data received from server', data.toString());
    });

    serverSocket.on('error', error => {
        console.error('Server socket error:', error);
        clientSocket.end(); // Close client socket if the server connection fails
    });

    clientSocket.on('end', () => {
        console.log('Client disconnected');
        serverSocket.end();
    });

    clientSocket.on('error', error => {
        console.error('Client socket error:', error);
        serverSocket.end(); // Close server socket if the client connection fails
    });
});

server.listen(PROXY_PORT, () => {
    console.log(`Proxy server listening on port ${PROXY_PORT}`);
});
