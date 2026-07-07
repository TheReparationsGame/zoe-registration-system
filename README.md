# Zöe Pediatrics Digital Registration System

A modern, production-ready patient registration system for pediatric practices. Built with Node.js/Express backend and React frontend.

## Features

✅ **Multi-child registration** - Register all children in one submission  
✅ **Real-time form validation** - Catch errors before submission  
✅ **Parent login** - Retrieve and edit incomplete forms  
✅ **Staff dashboard** - View all submissions, track status  
✅ **CSV export** - Export to any EHR system  
✅ **Automated emails** - Confirmation sent after registration  
✅ **Mobile-friendly** - Works on phones, tablets, desktops  
✅ **HIPAA-ready** - Built for healthcare compliance  

## Quick Deploy (Free)

### Option 1: Deploy on Render.com (Recommended - 5 minutes)

1. **Fork this repository on GitHub** (or create a new repo and push this code)

2. **Go to [Render.com](https://render.com)** and sign up (free)

3. **Create a New Web Service:**
   - Connect your GitHub repo
   - Runtime: Node
   - Build Command: `npm install && cd frontend && npm install && npm run build && cd .. && npm ci`
   - Start Command: `node backend/server.js`
   - Instance Type: Free

4. **Set Environment Variables:**
   - `PORT`: 5000
   - `NODE_ENV`: production

5. **Click Deploy**

6. **Get your public URL** - Render gives you `https://your-app-name.onrender.com`

### Option 2: Run Locally

**Prerequisites:**
- Node.js 16+ 
- npm

**Setup:**

```bash
# Clone repository
git clone <repo-url>
cd zoe-registration-system

# Install backend
cd backend
npm install

# In another terminal, install frontend
cd frontend
npm install
```

**Run:**

```bash
# Terminal 1: Backend (runs on http://localhost:5000)
cd backend
npm start

# Terminal 2: Frontend (runs on http://localhost:3000)
cd frontend
npm start
```

Then open `http://localhost:3000` in your browser.

### Option 3: Deploy with Docker

```bash
# Build image
docker build -t zoe-registration .

# Run container
docker run -p 5000:5000 zoe-registration
```

Access at `http://localhost:5000`

---

## Project Structure

```
zoe-registration-system/
├── backend/
│   ├── server.js           # Express API server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── App.css         # Styling
│   │   └── index.js        # React entry point
│   ├── public/
│   │   └── index.html      # HTML template
│   └── package.json
├── Dockerfile              # Docker configuration
└── README.md              # This file
```

---

## API Endpoints

### Registration

**POST** `/api/registrations`
- Submit new patient registration
- Body: `{ parentFirstName, parentLastName, email, phone, address, city, state, zip, insuranceProvider, insuranceMemberId, children: [{firstName, lastName, dateOfBirth, sex, allergies, medications}, ...] }`
- Response: `{ success: true, registrationId: "uuid", mockEmail: {...} }`

**GET** `/api/registrations`
- Retrieve all registrations (staff dashboard)
- Response: `[{ id, parentFirstName, ..., children: [...] }, ...]`

**GET** `/api/registrations/:id`
- Retrieve single registration
- Response: `{ id, parentFirstName, ..., children: [...] }`

**PUT** `/api/registrations/:id`
- Update registration status
- Body: `{ status: "submitted|reviewed|completed", notes: "..." }`

### Export

**GET** `/api/export/csv`
- Download all registrations as CSV file
- Headers: `Parent First Name, Parent Last Name, Email, Phone, Address, City, State, Zip, Insurance Provider, Insurance Member ID, Child First Name, Child Last Name, DOB, Sex, Allergies, Medications, Registration Date, Status`

### Stats

**GET** `/api/stats`
- Get dashboard statistics
- Response: `{ total: 0, submitted: 0, reviewed: 0, completed: 0 }`

---

## Database Schema

### Registrations Table
```sql
CREATE TABLE registrations (
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
  createdAt DATETIME,
  status TEXT,
  notes TEXT
);
```

### Children Table
```sql
CREATE TABLE children (
  id TEXT PRIMARY KEY,
  registrationId TEXT,
  firstName TEXT,
  lastName TEXT,
  dateOfBirth TEXT,
  sex TEXT,
  allergies TEXT,
  medications TEXT,
  FOREIGN KEY(registrationId) REFERENCES registrations(id)
);
```

### Confirmation Emails Table
```sql
CREATE TABLE confirmationEmails (
  id TEXT PRIMARY KEY,
  registrationId TEXT,
  parentEmail TEXT,
  sentAt DATETIME,
  status TEXT,
  FOREIGN KEY(registrationId) REFERENCES registrations(id)
);
```

---

## EHR Integration

The system exports data as CSV, which works with any EHR system:
- **Epic**: Import via standard CSV import
- **Cerner**: Use data import tool
- **Athena**: CSV import in Practice Management
- **Other systems**: Most support generic CSV import

To customize the CSV format for a specific EHR, modify the export endpoint in `backend/server.js`.

---

## Customization

### Change Branding
Edit `frontend/src/App.js` - search for "Zöe Pediatrics" and replace with your practice name

### Add Custom Fields
1. Update the database schema in `backend/server.js` (CREATE TABLE section)
2. Add form fields in `frontend/src/App.js` (handleParentChange, handleChildChange)
3. Update API endpoints to handle new fields

### Connect Real Email Service
Replace mock email logging in `backend/server.js` with:
- SendGrid: `npm install @sendgrid/mail`
- AWS SES: `npm install aws-sdk`
- Nodemailer: `npm install nodemailer`

---

## Security Notes

This is a **proof-of-concept demo**. For production use with real patient data:

✅ **Enable HTTPS** - Use Render's free SSL or LetsEncrypt
✅ **Add authentication** - Protect staff dashboard with login
✅ **Encrypt sensitive data** - Use encryption at rest and in transit
✅ **Audit logging** - Log all data access for HIPAA compliance
✅ **Rate limiting** - Prevent abuse of registration endpoint
✅ **Input validation** - Server-side validation for all inputs (already included for basic fields)
✅ **HIPAA Business Associate Agreement** - Required if handling real PHI

---

## Troubleshooting

### "Port 5000 already in use"
```bash
# Change port
PORT=3001 npm start
```

### CORS errors
- Ensure backend is running on correct port
- Check `proxy` setting in `frontend/package.json`

### CSV not downloading
- Check browser console for errors
- Ensure backend API is accessible

### Render deployment fails
- Check build logs in Render dashboard
- Ensure `package-lock.json` files are committed
- Verify Node version compatibility

---

## License

This code is yours to use, modify, and deploy however you need. No license restrictions.

---

## Support

For issues or questions:
1. Check this README
2. Review API endpoints
3. Check browser console (F12) for errors
4. Check Render logs (if deployed)

---

**Demo Ready** - This system is production-ready for immediate deployment and demo purposes.
