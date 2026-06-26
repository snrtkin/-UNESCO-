const express = require('express');

const router = express.Router();

router.get('/status', (_req, res) => {
  res.json({
    ok: true,
    authenticated: false,
    message: 'Auth routes are reserved for future admin access',
  });
});

module.exports = router;
