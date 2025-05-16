# Load environment variables from .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# test curl command
curl --silent "https://api.github.com/repos/Aminechakr/test-tracker/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/'

# test encoding URI value
echo -n "$SLACK_WEBHOOK_URL" | xxd -plain | tr -d '\n' | sed 's/\(..\)/%\1/g'
