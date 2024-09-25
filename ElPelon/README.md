# El Pelon Order Bot

This is a web application for El Pelon restaurant that uses the ChatGPT API to understand customer orders and generate a PDF with the order details.

## Prerequisites

- Node.js (v12 or higher)
- npm (comes with Node.js)
- A ChatGPT API key

## Setup

1. Clone this repository or download the source code.

2. Navigate to the project directory:
   ```
   cd ElPelon
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory of the project and add your ChatGPT API key:
   ```
   CHATGPT_API_KEY=your_api_key_here
   ```
   Replace `your_api_key_here` with your actual ChatGPT API key.

## Running the Application

1. Start the server:
   ```
   node server.js
   ```

2. Open a web browser and navigate to `http://localhost:3000` (or the port specified in your console output).

3. You should now see the El Pelon Order Bot interface. Type your order in the input field and press "Send" or hit Enter.

4. The bot will process your order using the ChatGPT API and generate a PDF with the order details.

## Files

- `index.html`: The main HTML file for the web application.
- `styles.css`: CSS styles for the application.
- `app.js`: Client-side JavaScript for handling user interactions and PDF generation.
- `server.js`: Node.js server that handles API requests and serves static files.
- `.env`: Configuration file for environment variables (API key).

## Note

Make sure to keep your API key confidential and never commit the `.env` file to version control systems.

## License

This project is open source and available under the [MIT License](LICENSE).