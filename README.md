# Release-Tracker

## How to ?

- Create `.env` file from the `.env.example` file :

    ```bash
    cp .env.example app/.env
    ```

- Fill the variables (**Github token** + **Slack webhook**, **Repositories** and **Cron Schedule Frequency**) in **`app/.env`** file.

- Start the Node service

    ```bash
    cd app/
    npm install
    npm start
    ```

The first run saves the latest releases of the watched repositories to `release-state.json`.

Future runs will check for new releases, update the file, and send alerts to Slack **if new version(s) found**.

#### Test Slack Webhook on terminal

```bash
curl -X POST \
    -H 'Content-type: application/json; charset=utf-8' \
    --data '{ "text": "This is a test message" }' \
    {SLACK_WEBHOOK_URL}
```

#### Release Tracker release

- When updating the code of Release-tracker Repo, update the version in [./app/package.json](./app/package.json) file:

```bash
  "version": "1.2.0",
```

- Also, tag the same version on your GItHub commit. This way, the workflow that builds the docker image of the service has the new version tag
