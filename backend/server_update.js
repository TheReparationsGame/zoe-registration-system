const express = require('express');
const path = require('path');

// Add this section after app.use(express.json()):
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Add this at the VERY END, before app.listen():
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
