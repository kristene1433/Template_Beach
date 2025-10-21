const express = require('express');

const router = express.Router();
const webhookRouter = express.Router();

const demoResponse = {
  demoMode: true,
  message: 'Stripe payments are disabled in demo mode. No live payment processing is available.',
};

router.use((req, res) => {
  res.status(503).json(demoResponse);
});

webhookRouter.use((req, res) => {
  res.status(200).json({ ...demoResponse, webhookIgnored: true });
});

module.exports = { router, webhookRouter };
