# Use the official Node.js image as base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the frontend files
COPY . .

# Expose port 3000 (default for frontend development server)
EXPOSE 3000

# Command to start the frontend app
CMD ["npm", "run", "dev"]
