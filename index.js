const axios = require('axios');
const cron = require('node-cron');
const dotenv = require('dotenv');

dotenv.config();

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
  { owner: 'AmineChakr', repo: 'test-tracker' },
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
  } catch (error) {
    console.error(`[${getCurrentDateTime()}] Error occurred while fetching releases:`, error);
  }
}

async function notifySlack(message) {
  try {
    await axios.post(slackWebhookUrl, { text: message });
    console.log(`[${getCurrentDateTime()}] Slack notification sent successfully.`);
  } catch (error) {
    console.error(`[${getCurrentDateTime()}] Error occurred while sending Slack notification:`, error);
  }
}

// Schedule the checkReleasesAndNotify function to run every minute.
cron.schedule('* * * * *', () => {
  console.log(`[${getCurrentDateTime()}] Checking for new releases...`);
  checkReleasesAndNotify();
});

