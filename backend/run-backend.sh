#!/bin/bash

# Build the Docker image
docker build -t deervolution-backend .

# Run the container with environment variables from file
docker run -d \
  --env-file .env \
  -p 8000:8000 \
  deervolution-backend