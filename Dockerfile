# Use the official Node.js image as a base
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json, yarn.lock, and other necessary files
COPY package.json yarn.lock ./

# Install dependencies with Yarn
RUN yarn

# Copy the entire project into the container
COPY . .

# Build the Next.js application using Yarn
RUN yarn build

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js app using Yarn
CMD ["yarn", "start"]