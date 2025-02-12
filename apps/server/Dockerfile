FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy the Node.js app into the container
COPY . .

# Install dependencies
RUN bun install
EXPOSE 3009

# Set the command to start the Node.js app
CMD ["bun", "start"]
