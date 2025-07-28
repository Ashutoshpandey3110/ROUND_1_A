# Use an official Node.js runtime as a parent image
# Specify the platform to ensure compatibility with the amd64 architecture
FROM --platform=linux/amd64 node:18-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first
# This leverages Docker's layer caching, so dependencies are only re-installed if these files change
COPY package*.json ./

# Install app dependencies
# Using --omit=dev to skip installing development-only packages (e.g., nodemon, testing libraries)
RUN npm install --omit=dev

# Bundle app source
COPY . .

# Your app binds to port 8080, so expose it
# (Note: This is good practice but not strictly required by the hackathon rules as there's no network)
EXPOSE 8080

# Define the command to run your app
CMD [ "node", "processAll.js" ]
