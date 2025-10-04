# Pacee.Pro

Precision timing for every workout - an interval training timer application built with Encore.ts and React.

## Overview

Pacee.Pro is a full-stack interval training timer that offers pre-configured workout modes and custom timer creation. The app features audio notifications, browser notifications, wake lock support, and workout history tracking.

## Features

- **Japanese Walking Protocol**: 5 × 3min intervals (32 min total)
- **Norwegian 4×4 Protocol**: 4 × 4min intervals (43 min total)
- **Custom Timer**: Create and save your own interval configurations
- **Audio Notifications**: Sound alerts for phase transitions
- **Browser Notifications**: Desktop notifications when tab is not active
- **Wake Lock**: Prevents screen from turning off during workouts
- **Workout History**: Track completed sessions
- **Preset Management**: Save and reuse custom timer configurations

## Tech Stack

### Backend
- **Encore.ts**: TypeScript backend framework
- **PostgreSQL**: Database for storing presets and session history

### Frontend
- **React**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS v4**: Styling
- **Vite**: Build tool
- **shadcn/ui**: UI components
- **Lucide React**: Icons

## Project Structure

```
backend/
├── db/
│   ├── index.ts
│   └── migrations/
│       └── 001_create_tables.up.sql
└── timer/
    ├── encore.service.ts
    ├── create_preset.ts
    ├── create_session.ts
    ├── delete_preset.ts
    ├── list_presets.ts
    └── list_sessions.ts

frontend/
├── App.tsx
├── components/
│   ├── InfoPanel.tsx
│   ├── PresetManager.tsx
│   ├── ProgressBar.tsx
│   └── TimerDisplay.tsx
├── hooks/
│   ├── useAudio.ts
│   ├── useNotifications.ts
│   ├── useTimer.ts
│   └── useWakeLock.ts
└── pages/
    ├── CustomTimer.tsx
    ├── Home.tsx
    ├── JapaneseWalking.tsx
    └── Norwegian4x4.tsx
```

## API Endpoints

- `POST /presets` - Create a new timer preset
- `GET /presets` - List all saved presets
- `DELETE /presets/:id` - Delete a preset
- `POST /sessions` - Save a completed workout session
- `GET /sessions` - List workout history

## Development

This application runs on the Leap platform with automatic dependency installation and deployment.

## Credits

Created by [James Harvey Media](https://jamesharvey.blog/)
