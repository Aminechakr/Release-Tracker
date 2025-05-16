# Release-Tracker

## How to ?

- Fill the variables (**Github token** + **Slack webhook**, **Repositories** and **Cron Schedule Frequency**) in **`app/.env`** file.
    ```bash
    cp .env.example app/.env
    ```
- Start the Node service

    ```bash
    cd app/
    npm install
    npm start
    ```

The first run saves the latest releases to `release-state.json`. Future runs check for new releases, update the file, and send alerts to Slack.


#### Test Slack Webhook on terminal

```bash
curl -X POST \
    -H 'Content-type: application/json; charset=utf-8' \
    --data '{ "text": "This is a test message" }' \
    {SLACK_WEBHOOK_URL}
```