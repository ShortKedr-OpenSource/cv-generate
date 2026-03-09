# CV Generated

## Local run

### Option 1: Node server

```bash
.\.tools\node\npm.cmd start
```

Default URL: `http://localhost:8080`

This command works in two cases:
- when Node.js is installed globally
- when a local portable Node exists in `.tools/node`

If you want to start it directly without npm:

```bash
.\.tools\node\node.exe .\server.js
```

### Option 2: Docker (Nginx)

```bash
docker build -t cv-generated .
docker run --rm -p 8080:80 cv-generated
```

Open: `http://localhost:8080`

## Hosting

This repo now includes production-ready static hosting config:
- `Dockerfile`
- `nginx.conf`

Deploy the built image to any container host (Render, Railway, Fly.io, AWS ECS, etc.).
