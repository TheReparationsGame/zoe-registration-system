const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const dbPath = process.env.DATABASE_URL || './registrations.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('DB connection error:', err);
  else console.log('Connected to SQLite database');
});

// Initialize database tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      parentFirstName TEXT,
      parentLastName TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      insuranceProvider TEXT,
      insuranceMemberId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'submitted',
      notes TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS children (
      id TEXT PRIMARY KEY,
      registrationId TEXT,
      firstName TEXT,
      lastName TEXT,
      dateOfBirth TEXT,
      sex TEXT,
      allergies TEXT,
      medications TEXT,
      FOREIGN KEY(registrationId) REFERENCES registrations(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS confirmationEmails (
      id TEXT PRIMARY KEY,
      registrationId TEXT,
      parentEmail TEXT,
      sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'sent',
      FOREIGN KEY(registrationId) REFERENCES registrations(id)
    )
  `);
});

// POST: Submit new registration
app.post('/api/registrations', (req, res) => {
  const { parentFirstName, parentLastName, email, phone, address, city, state, zip, insuranceProvider, insuranceMemberId, children } = req.body;

  if (!parentFirstName || !email || !children || children.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const registrationId = uuidv4();
  const parentData = [registrationId, parentFirstName, parentLastName, email, phone, address, city, state, zip, insuranceProvider, insuranceMemberId];

  db.run(
    `INSERT INTO registrations (id, parentFirstName, parentLastName, email, phone, address, city, state, zip, insuranceProvider, insuranceMemberId) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    parentData,
    function(err) {
      if (err) {
        console.error('Registration insert error:', err);
        return res.status(500).json({ error: 'Failed to create registration' });
      }

      const childPromises = children.map(child => {
        return new Promise((resolve, reject) => {
          const childId = uuidv4();
          db.run(
            `INSERT INTO children (id, registrationId, firstName, lastName, dateOfBirth, sex, allergies, medications) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [childId, registrationId, child.firstName, child.lastName, child.dateOfBirth, child.sex, child.allergies || '', child.medications || ''],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      });

      Promise.all(childPromises)
        .then(() => {
          const emailId = uuidv4();
          db.run(
            `INSERT INTO confirmationEmails (id, registrationId, parentEmail) VALUES (?, ?, ?)`,
            [emailId, registrationId, email],
            (err) => {
              if (err) console.error('Email log error:', err);
            }
          );

          res.status(201).json({
            success: true,
            registrationId,
            message: `Registration submitted for ${parentFirstName}. Confirmation email would be sent to ${email}`,
            mockEmail: {
              to: email,
              subject: 'Zöe Pediatrics: Registration Confirmation',
              body: `Dear ${parentFirstName},\n\nThank you for registering ${children.length} child(ren) with Zöe Pediatrics. Your registration has been received and will be reviewed by our team.\n\nRegistration ID: ${registrationId}\n\nBest regards,\nZöe Pediatrics Team`
            }
          });
        })
        .catch(err => {
          console.error('Child insert error:', err);
          res.status(500).json({ error: 'Failed to add child records' });
        });
    }
  );
});

// GET: Retrieve all registrations
app.get('/api/registrations', (req, res) => {
  db.all('SELECT * FROM registrations ORDER BY createdAt DESC', (err, registrations) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: 'Failed to fetch registrations' });
    }

    const promises = registrations.map(reg => {
      return new Promise((resolve) => {
        db.all('SELECT * FROM children WHERE registrationId = ?', [reg.id], (err, children) => {
          resolve({ ...reg, children: children || [] });
        });
      });
    });

    Promise.all(promises).then(fullRegistrations => {
      res.json(fullRegistrations);
    });
  });
});

// GET: Retrieve single registration
app.get('/api/registrations/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM registrations WHERE id = ?', [id], (err, registration) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!registration) return res.status(404).json({ error: 'Registration not found' });

    db.all('SELECT * FROM children WHERE registrationId = ?', [id], (err, children) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch children' });
      res.json({ ...registration, children: children || [] });
    });
  });
});

// PUT: Update registration status
app.put('/api/registrations/:id', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  db.run(
    'UPDATE registrations SET status = ?, notes = ? WHERE id = ?',
    [status, notes, id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to update registration' });
      res.json({ success: true, message: 'Registration updated' });
    }
  );
});

// GET: Export all registrations as CSV
app.get('/api/export/csv', (req, res) => {
  db.all('SELECT * FROM registrations ORDER BY createdAt DESC', (err, registrations) => {
    if (err) return res.status(500).json({ error: 'Export failed' });

    const promises = registrations.map(reg => {
      return new Promise((resolve) => {
        db.all('SELECT * FROM children WHERE registrationId = ?', [reg.id], (err, children) => {
          resolve({ ...reg, children: children || [] });
        });
      });
    });

    Promise.all(promises).then(fullReg => {
      let csv = 'Parent First Name,Parent Last Name,Email,Phone,Address,City,State,Zip,Insurance Provider,Insurance Member ID,Child First Name,Child Last Name,DOB,Sex,Allergies,Medications,Registration Date,Status\n';

      fullReg.forEach(reg => {
        if (reg.children.length === 0) {
          csv += `${reg.parentFirstName},${reg.parentLastName},${reg.email},${reg.phone},${reg.address},${reg.city},${reg.state},${reg.zip},${reg.insuranceProvider},${reg.insuranceMemberId},,,,,,,${reg.createdAt},${reg.status}\n`;
        } else {
          reg.children.forEach((child, idx) => {
            if (idx === 0) {
              csv += `${reg.parentFirstName},${reg.parentLastName},${reg.email},${reg.phone},${reg.address},${reg.city},${reg.state},${reg.zip},${reg.insuranceProvider},${reg.insuranceMemberId},${child.firstName},${child.lastName},${child.dateOfBirth},${child.sex},${child.allergies},${child.medications},${reg.createdAt},${reg.status}\n`;
            } else {
              csv += `,,,,,,,,,,${child.firstName},${child.lastName},${child.dateOfBirth},${child.sex},${child.allergies},${child.medications},${reg.createdAt},${reg.status}\n`;
            }
          });
        }
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="zoe-registrations.csv"');
      res.send(csv);
    });
  });
});

// GET: Dashboard stats
app.get('/api/stats', (req, res) => {
  db.all('SELECT COUNT(*) as total, status FROM registrations GROUP BY status', (err, stats) => {
    if (err) return res.status(500).json({ error: 'Stats query failed' });

    const statObj = { total: 0, submitted: 0, reviewed: 0, completed: 0 };
    stats.forEach(s => {
      statObj.total += s.total;
      statObj[s.status] = s.total;
    });

    res.json(statObj);
  });
});

// GET: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// POST: ROI Calculator - send email silently
app.post('/api/calculator', async (req, res) => {
  const { noShowRate, staffHoursPerWeek, copayCollection, revenuePerVisit } = req.body;

  if (!noShowRate || !staffHoursPerWeek || !copayCollection || !revenuePerVisit) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newPatients = 500;
  const visitsPerPatient = 1.5;
  const totalAppointments = newPatients * visitsPerPatient;
  
  const currentNoShows = totalAppointments * (noShowRate / 100);
  const reducedNoShows = totalAppointments * ((noShowRate - 10) / 100);
  const noShowSavings = (currentNoShows - reducedNoShows) * revenuePerVisit;

  const staffCostPerHour = 30;
  const weeklyStaffSavings = staffHoursPerWeek * 0.2 * staffCostPerHour;
  const annualStaffSavings = weeklyStaffSavings * 52;

  const currentCopayCollection = totalAppointments * (copayCollection / 100) * 25;
  const improvedCopayCollection = totalAppointments * (copayCollection / 100) * 88;
  const copayGain = improvedCopayCollection - currentCopayCollection;

  const totalAnnualBenefit = noShowSavings + annualStaffSavings + copayGain;
  const implementationCost = 12000;
  const paybackMonths = (implementationCost / totalAnnualBenefit) * 12;

  const results = {
    noShowSavings: noShowSavings.toFixed(2),
    staffSavings: annualStaffSavings.toFixed(2),
    copayGain: copayGain.toFixed(2),
    totalAnnualBenefit: totalAnnualBenefit.toFixed(2),
    implementationCost: implementationCost,
    paybackMonths: paybackMonths.toFixed(1),
    roi: ((totalAnnualBenefit * 3 - implementationCost) / implementationCost * 100).toFixed(0)
  };

  // Send response immediately
  res.json({ success: true, results });

  // Send email in background - fix: create new transporter each time
  try {
    const transporter = nodemailer.createTransport({
      host: 'mail.asmproductions.co',
      port: 465,
      secure: true,
      auth: {
        user: 'freelance@asmproductions.co',
        pass: process.env.SMTP_PASSWORD
      },
      connectionTimeout: 10000,
      socketTimeout: 10000
    });

    const htmlContent = `<h2>ROI Calculator Results</h2><p><strong>No-Show Rate:</strong> ${noShowRate}%</p><p><strong>Staff Hours/Week:</strong> ${staffHoursPerWeek}</p><p><strong>Copay Collection Rate:</strong> ${copayCollection}%</p><p><strong>Revenue per Visit:</strong> $${revenuePerVisit}</p><hr><h3>Calculated Results:</h3><p><strong>Annual No-Show Savings:</strong> $${results.noShowSavings}</p><p><strong>Annual Staff Efficiency Savings:</strong> $${results.staffSavings}</p><p><strong>Annual Copay Collection Gain:</strong> $${results.copayGain}</p><p><strong>Total Annual Benefit:</strong> $${results.totalAnnualBenefit}</p><p><strong>Payback Period:</strong> ${results.paybackMonths} months</p><p><strong>3-Year ROI:</strong> ${results.roi}%</p>`;

    await transporter.sendMail({
      from: 'freelance@asmproductions.co',
      to: 'freelance@asmproductions.co',
      subject: 'Zoe Pediatrics - ROI Calculator Results',
      html: htmlContent
    });

    console.log('Email sent successfully');
  } catch (err) {
    console.error('Email error:', err.message);
  }
});

// Catch-all: Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Zöe Registration System running on port ${PORT}`);
});
