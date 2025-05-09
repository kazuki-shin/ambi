# Ambi Web Frontend

This project is the web frontend for the Ambi conversational companion proof of concept (POC), built with React and TypeScript.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or later)
- npm (v7 or later)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kazuki-shin/ambi.git
   cd ambi/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (if needed):
   ```bash
   cp .env.example .env
   ```

### Running the Application

Start the development server:

```bash
npm start
```

The application will be available at http://localhost:3000 by default.

## Project Structure

```
frontend/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable UI components
│   ├── contexts/      # React contexts for state management
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── services/      # API and external service integrations
│   ├── styles/        # Global styles and Tailwind configuration
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main application component
│   └── index.tsx      # Application entry point
├── package.json       # Project dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

## Key Features

- **Accessible Interface**: High-contrast, elder-friendly UI components
- **Voice Interaction**: Integration with Web Speech API for speech recognition
- **Text Conversation**: Text-based chat interface
- **Emotion Detection**: Visual indicators of detected emotions
- **Responsive Design**: Optimized for desktop and tablet devices

## Development

### Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run lint`: Runs ESLint to check for code issues

### Testing

Run the test suite:

```bash
npm test
```

### Building for Production

Create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Learn More

For more information about the Ambi project, see the main [documentation](../docs/README.md).
