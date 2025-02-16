FROM node:20-slim

# Install Python and required packages
RUN apt-get update && apt-get install -y \
    python3-full \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create and activate virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy Python requirements and install in venv
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create temp directory for image uploads
RUN mkdir temp

# Copy and load environment variables
COPY .env .env

# Expose port
EXPOSE 8000

# Start the application using environment variables
CMD ["node", "server.js"] 