# test curl command
curl --silent "https://api.github.com/repos/Aminechakr/test-tracker/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/'
# test encoding URI value 
echo -n 'https://hooks.slack.com/services/xxxxxxx/xxxxxxxx/xxxxxxxx' | xxd -plain | tr -d '\n' | sed 's/\(..\)/%\1/g'
