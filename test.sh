# test curl command
curl --silent "https://api.github.com/repos/Aminechakr/test-tracker/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/'
# test encoding URI value 
echo -n 'https://hooks.slack.com/services/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' | xxd -plain | tr -d '\n' | sed 's/\(..\)/%\1/g'
