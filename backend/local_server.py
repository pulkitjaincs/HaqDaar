import json
import logging
from http.server import BaseHTTPRequestHandler, HTTPServer
from app import handler

class LambdaHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8')
        
        event = {
            'rawPath': self.path,
            'requestContext': {'http': {'method': 'POST'}},
            'body': post_data
        }
        
        response = handler(event, None)
        
        self.send_response(response['statusCode'])
        for k, v in response.get('headers', {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(response['body'].encode('utf-8'))

    def do_GET(self):
        event = {
            'rawPath': self.path,
            'requestContext': {'http': {'method': 'GET'}}
        }
        
        response = handler(event, None)
        
        self.send_response(response['statusCode'])
        for k, v in response.get('headers', {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(response['body'].encode('utf-8'))

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    server_address = ('', 5000)
    httpd = HTTPServer(server_address, LambdaHandler)
    print("Starting local backend server at http://localhost:5000")
    httpd.serve_forever()
