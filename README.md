# Bitwarden CSV Duplicate Manager

A web application to help you manage and remove duplicate entries from Bitwarden CSV exports.

## Features

- Upload CSV files exported from Bitwarden
- Automatically detect duplicate entries based on URI, username, and password
- Review duplicates in a user-friendly interface
- Selectively remove duplicate entries
- Download the cleaned CSV file

## Setup

1. Make sure you have Node.js installed on your system
2. Clone this repository
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Export your Bitwarden vault to CSV format
2. Upload the CSV file using the web interface
3. Review the duplicate entries found
4. Click "Remove" on the entries you want to delete
5. Download the cleaned CSV file when you're done

## CSV Format

The application expects CSV files in the Bitwarden export format with the following columns:
- folder
- favorite
- type
- name
- notes
- fields
- reprompt
- login_uri
- login_username
- login_password
- login_totp

## Security Note

This application runs locally on your machine and does not send any data to external servers. All processing is done in-memory for security. 

## Link to the article

[Bitwarden Duplicate Manager](https://blog.gtchakama.com/bitwarden-duplicate-manager)