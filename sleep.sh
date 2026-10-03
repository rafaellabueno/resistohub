# wait-for-it.sh
#!/usr/bin/env sh
#   Use this script to test if a given TCP port is available
#   The script will wait until the port becomes available
#   Arguments:
#     host:port   - The host and port to wait for

set -e

HOST="$1"
PORT="$2"
TIMEOUT="${3:-30}"

if [ -z "$HOST" ] || [ -z "$PORT" ]; then
  echo "Usage: $0 host port [timeout]"
  exit 1
fi

echo "Waiting for $HOST:$PORT to become available..."

end=$((SECONDS + $TIMEOUT))
while ! nc -z "$HOST" "$PORT"; do
  if [ $SECONDS -ge $end ]; then
    echo "Timed out waiting for $HOST:$PORT"
    exit 1
  fi
  sleep 1
done

echo "$HOST:$PORT is available"
