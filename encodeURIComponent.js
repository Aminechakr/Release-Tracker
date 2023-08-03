const originalSlackWebhookUrl = `https://${process.env.SLACK_WEBHOOK_URL}`;
const encodedSlackWebhookUrl = encodeURIComponent(originalSlackWebhookUrl);
console.log(encodedSlackWebhookUrl);

