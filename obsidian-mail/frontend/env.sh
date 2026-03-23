#!/bin/sh
# Generate env.js injecting Docker environment variables at runtime
echo "window.__env = window.__env || {};" > /usr/share/nginx/html/env.js
echo "window.__env.clientId = '${OIDC_CLIENT_ID}';" >> /usr/share/nginx/html/env.js
echo "window.__env.requiredGroup = '${REQUIRED_GROUP}';" >> /usr/share/nginx/html/env.js
