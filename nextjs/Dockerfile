
FROM node:20-alpine

WORKDIR /app

# Copy package.json files
COPY nextjs/package*.json ./nextjs/

# Install dependencies for Next.js
WORKDIR /app/nextjs
RUN npm install

# Copy the rest of the application code
COPY . ./nextjs

# Expose the port Next.js runs on
EXPOSE 4321 

# Start the Next.js application in development mode
CMD ["npm", "run", "dev"]

