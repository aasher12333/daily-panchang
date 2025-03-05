# Daily Panchang

**Daily Panchang** is a web application that provides daily Vedic astrological timings, including Rahu Kalam, Choghadiya, Hora, and a Vedic calendar, based on the user's location and selected date. The app is built with a modern, user-friendly interface and supports automatic recalculation of timings when the location or date changes.

## Features

- **Rahu Kalam**: Displays the inauspicious Rahu Kalam period for the selected date and location.
- **Choghadiya**: Provides day and night Choghadiya schedules (auspicious and inauspicious periods) with color-coded indicators.
- **Hora**: Shows hourly planetary influences (Horas) for the day and night, with auspiciousness indicators.
- **Vedic Calendar**: Displays a monthly calendar with Vedic tithis, nakshatras, paksha (Shukla/Krishna), festivals, and moon phases.
- **Location-Based Timings**: Automatically detects the user's location via geolocation or allows manual selection using a typeahead city search (powered by Nominatim API).
- **Automatic Recalculation**: Updates timings automatically when the date or location changes.
- **Responsive Design**: Works seamlessly on both desktop and mobile devices with a hamburger menu for mobile navigation.

## Installation

### Prerequisites
- **Node.js** (v18 or higher) and **npm** (v8 or higher) installed on your system.
- A web browser (e.g., Chrome, Firefox) for testing the app.

### Steps
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd daily-panchang