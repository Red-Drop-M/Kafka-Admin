# Use Bun's official image
FROM oven/bun:1.0

# Set working directory
WORKDIR /app

# Copy everything from the local directory to the working directory inside the container
COPY . /app/

# Install all dependencies (including devDependencies)
RUN bun install

# Expose the port your API runs on
EXPOSE 3000

# Run the TypeScript entry point using Bun
CMD ["bun", "run", "src/index.ts"]
