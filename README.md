

---

# Our Voice, Our Rights – MGNREGA Dashboard

**Project Overview**
“Our Voice, Our Rights” is a **district-level MGNREGA performance dashboard** designed to make government data **easy to access and understand** for citizens, especially in rural areas. The dashboard provides clear visuals, audio narration, and comparisons to help users understand the performance of their district in the MGNREGA scheme.

---

## Features

### **User-Friendly Features**

* Auto-detect district using **GPS** or select from a **dropdown**.
* Simple, **mobile-first design** with **Hindi language support**.
* Large **metric cards** for:

  * Jobs Provided 👷‍♂️
  * Wages Paid 💰
  * Pending Payments ⏳
  * Person-Days 👥
* Color-coded metrics (Green = Good, Yellow = Average, Red = Needs Attention).
* **Audio narration** for each metric card.

### **Visualizations**

* **Monthly trends** with sparkline charts (last 12 months).
* **District vs State vs Neighboring District** comparisons using bar charts.

### **Accessibility & Offline Support**

* Offline mode shows **last updated data** if API is down.
* High-contrast fonts and **touch-friendly buttons**.
* Simple **icons and visual indicators** for low-literacy users.

### **Additional Features**

* **Report issue form** for delayed wages or complaints.
* **PDF download** of district performance summary.
* Color-coded alerts for immediate attention.

---

## **Technical Architecture**

1. **Data Ingestion**

   * Periodically fetches MGNREGA data from [data.gov.in API](https://data.gov.in).
   * Stores data in a **local database** (PostgreSQL/MySQL).
   * Keeps raw JSON snapshots for backup and debugging.

2. **Backend**

   * Built with **Flask / FastAPI / Node.js**.
   * Serves data from **local database** to frontend, not directly from API.
   * Uses **Redis cache** for fast response and resilience.

3. **Frontend**

   * Built using **React / HTML + CSS + JS**, mobile-first layout.
   * Displays **metric cards, trend charts, comparisons, and audio buttons**.

4. **Hosting**

   * Hosted on a **VPS (DigitalOcean / AWS / Hetzner)**.
   * HTTPS enabled for secure access.

---

## **How to Use**

1. Open the web app in your mobile or desktop browser.
2. **Detect your district** automatically via GPS or select manually from the dropdown.
3. View the **dashboard** with Jobs, Wages, Pending Payments, and Person-Days.
4. Click the **audio button** to hear the metric explanation in Hindi.
5. Scroll down for **monthly trends and comparison charts**.
6. Optionally, **report issues** or download **PDF summary**.

---

## **Installation / Setup (Developer Instructions)**

> *For local development and testing.*

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/mgnrega-dashboard.git
cd mgnrega-dashboard
```

2. **Setup Backend**

```bash
# Install dependencies
pip install -r requirements.txt   # For Flask/FastAPI
# OR
npm install                      # For Node.js backend

# Setup database (PostgreSQL/MySQL)
# Create tables and run initial data ingestion
python ingest_data.py
```

3. **Start Backend**

```bash
# Flask
python app.py
# FastAPI
uvicorn app:app --reload
# Node.js
npm start
```

4. **Setup Frontend**

```bash
cd frontend
npm install
npm start
```

5. **Access App**

* Open `http://localhost:3000` (or your configured port) in your browser.

---

## **Future Enhancements**

* Multi-language support (local dialects).
* SMS / push notifications for new data or pending wages.
* Video tutorials or voice commands.
* Map view of district performance.

