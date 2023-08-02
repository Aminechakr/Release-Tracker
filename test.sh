# test curl command
curl --silent "https://api.github.com/repos/Aminechakr/test-tracker/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/'