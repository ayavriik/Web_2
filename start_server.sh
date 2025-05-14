#!/bin/bash

# Check if Python 3 is available
if command -v python3 &>/dev/null; then
    echo "Starting server using Python 3..."
    python3 -m http.server 8000
# Check if Python 2 is available
elif command -v python &>/dev/null; then
    echo "Starting server using Python 2..."
    python -m SimpleHTTPServer 8000
# Check if PHP is available
elif command -v php &>/dev/null; then
    echo "Starting server using PHP..."
    php -S localhost:8000
else
    echo "Error: Neither Python nor PHP is installed."
    echo "Please install Python 3 or PHP to run a local server."
    exit 1
fi 