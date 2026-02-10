const path = require('path');
const express = require('express');

const router = express.Router();
const publicDir = path.join(__dirname, '../../public');

const pages = ['index', 'register', 'login', 'dashboard', 'profile', 'auctions', 'auction-detail', 'admin', 'pending-approvals', 'create-auction'];

pages.forEach((page) => {
  const route = page === 'index' ? '/' : `/${page}`;
  router.get(route, (req, res) => {
    res.sendFile(path.join(publicDir, `${page}.html`));
  });
});

module.exports = router;
