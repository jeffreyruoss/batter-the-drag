# Local dev server that serves /ensete as ensete.html, like GitHub Pages does.
# Run: python3 serve.py  (http://localhost:4480)
import http.server
import os


class Handler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.path.split('?', 1)[0].split('#', 1)[0]
        if path != '/' and '.' not in os.path.basename(path) and os.path.isfile(self.translate_path(path) + '.html'):
            self.path = path + '.html' + self.path[len(path):]
        return super().send_head()


http.server.ThreadingHTTPServer(('127.0.0.1', 4480), Handler).serve_forever()
