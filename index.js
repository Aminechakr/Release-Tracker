const axios = require('axios');
const cron = require('node-cron');
const packageJson = require('./package.json');

//dotenv.config();
// Get the GitHub access token and Slack webhook URL from the system environment variables
const accessToken = process.env.GITHUB_ACCESS_TOKEN;
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

// List of GitHub repositories to check.
const repositoriesToCheck = [
  { owner: 'ChainSafe', repo: 'lodestar' },    
  { owner: 'ethpandaops', repo: 'checkpointz' },
  { owner: 'ethereum', repo: 'go-ethereum' },
  { owner: 'hyperledger', repo: 'besu' },
  { owner: 'NethermindEth', repo: 'nethermind' },
  { owner: 'prometheus', repo: 'prometheus' },
  { owner: 'grafana', repo: 'grafana' },
  { owner: 'grafana', repo: 'loki' },
  { owner: 'flashbots', repo: 'mev-boost' },
  { owner: 'AmineChakr', repo: 'Release-Tracker' },
  // Add more repositories as needed.
];

// Object to store the latest release information for each repository.
const latestReleases = {};

function getCurrentDateTime() {
  const now = new Date();
  return now.toISOString();
}

async function checkReleasesAndNotify() {
  try {
    console.log(`[${getCurrentDateTime()}] Checking for new releases...`);
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

          // Notify on Slack about the new release.
          const message = `🏆 New version of ${repo} released: ${latestRelease.tag_name} 🎉`;
          await notifySlack(message);

          // Update the latest release information in memory.
          latestReleases[`${owner}/${repo}`] = latestRelease.tag_name;
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
cron.schedule('0 0 0 * * *', () => {
  checkReleasesAndNotify();
});
