#!/bin/sh
# This script simply waits for 20 seconds and then runs the provided command

# Sleep for 20 seconds
sleep 20

# Execute the provided command
exec "$@"
