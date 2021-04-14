FROM node:alpine

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV production

# Bundle app source
COPY . /app

# Install app dependencies
RUN npm install --production

# Define ENV Variables
ENV CLIENT_ID client-id-from-developer-dot-webex-dot-com
ENV CLIENT_SECRET client-secret-from-developer-dot-webex-dot-com
ENV PUBLIC_URL https-url-here-without-trailing-slash
ENV SESSION_SECRET please-change-me-to-a-session-secret
ENV STATE_SECRET please-change-me-to-a-state-secret
ENV PORT 3000

EXPOSE 3000
CMD [ "node", "app.js" ]
