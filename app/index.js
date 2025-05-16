const axios = require('axios');
const cron = require('node-cron');
const packageJson = require('./package.json');
const fs = require('fs');
const stateFile = './release-state.json';

require('dotenv').config();

// Get the GitHub access token, Slack webhook URL and Cron Schedule Frequency from the system environment variables
const accessToken = process.env.GITHUB_ACCESS_TOKEN;
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
const cronSchedule = process.env.CRON_SCHEDULE;

let latestReleases = {};
try {
  latestReleases = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
} catch {
  latestReleases = {};
}

// Load (from .env) vars and Parse the list of GitHub repositories to check.
const repositoriesToCheck = process.env.REPOSITORIES
  .split(',')
  .map(entry => {
    const [owner, repo] = entry.split('/');
    return { owner, repo };
  });

function getCurrentDateTime() {
  const now = new Date();
  return now.toISOString();
}

async function checkReleasesAndNotify() {
  try {
    console.log(`[${getCurrentDateTime()}] Checking for new releases...`);
    // Loop over Repositories and check releases
    for (const { owner, repo } of repositoriesToCheck) {
      const releasesUrl = `https://api.github.com/repos/${owner}/${repo}/releases`;
      const response = await axios.get(releasesUrl, {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      });

      const releases = response.data;
      if (releases && releases.length > 0) {
        const latestRelease = releases[0];

        // Check if a new release is available and notify on Slack.
        if (!latestReleases[`${owner}/${repo}`] || latestReleases[`${owner}/${repo}`] !== latestRelease.tag_name) {
          console.log(`[${getCurrentDateTime()}] New version of ${owner}/${repo} released: ${latestRelease.tag_name}`);

          // Send Slack notification(s).
          const message = `🏆 New version of ${repo} released: ${latestRelease.tag_name} 🎉`;
          await notifySlack(message);

          // Update the latest release information in memory.
          latestReleases[`${owner}/${repo}`] = latestRelease.tag_name;

          // Save the latest releases to JSON stateFile.
          fs.writeFileSync(stateFile, JSON.stringify(latestReleases, null, 2));

        } else {
          console.log(`[${getCurrentDateTime()}] No new releases found for the repository ${owner}/${repo}.`);
        }
      } else {
        console.log(`[${getCurrentDateTime()}] No releases found for the repository ${owner}/${repo}.`);
      }
    }
    console.log(`[${getCurrentDateTime()}] Release check completed.`);
  } catch (error) {
    console.error(`[${getCurrentDateTime()}] Error occurred while fetching or notifying releases:`, error.message);
  }
}

// Slack notification send.
async function notifySlack(message) {
  try {
    await axios.post(slackWebhookUrl, { text: message });
    console.log(`[${getCurrentDateTime()}] Slack notification sent successfully.`);
  } catch (error) {
    console.error(`[${getCurrentDateTime()}] Error occurred while sending Slack notification:`, error.message);
  }
}

// Print a message when the service starts up.
console.log(`[${getCurrentDateTime()}] Service is up and running.`);
console.log(`[${getCurrentDateTime()}] Version: ${packageJson.version}`);

// Schedule the checkReleasesAndNotify function to run every day at midnight.
cron.schedule(cronSchedule, () => {
  checkReleasesAndNotify();
});
