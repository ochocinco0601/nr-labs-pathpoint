# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This repository serves as **reference material for business observability work**. It is not intended for active development or contributions - it's maintained as a learning resource and reference implementation for understanding how to model business processes end-to-end using telemetry data.

## Development Commands

- `npm start` - Start the development server using New Relic's nr1 CLI
- `npm run eslint-check` - Run ESLint to check for linting issues
- `npm run eslint-fix` - Run ESLint with auto-fix for correctable issues
- `npm test` - Run tests (currently exits 0, no active test suite)

## NR1 CLI Commands

This is a New Relic Nerdpack that requires the NR1 CLI:
- `nr1 nerdpack:build` - Build the nerdpack for production
- `nr1 nerdpack:serve` - Serve the nerdpack locally (same as npm start)
- `nr1 nerdpack:validate` - Validate nerdpack schema and structure

## Architecture Overview

Pathpoint v2 is a New Relic One application built as a React-based Nerdpack for modeling business processes end-to-end. The codebase follows a component-based architecture with React contexts for state management.

### Key Architecture Components

**Nerdlets Structure:**
- `nerdlets/home/` - Main application entry point and primary interface
- `nerdlets/create-flow/` - Flow creation wizard with import/blank flow options
- `nerdlets/signal-selection/` - Entity and signal selection interface with filtering
- `nerdlets/product-tour/` - Guided tour functionality with step definitions

**Core Components (`src/components/`):**
- Flow management: `flow/`, `flow-list/`, `flow-settings-modal/`
- Process visualization: `stage/`, `stages/`, `step/`, `level/`
- Signal handling: `signal/`, `signals-grid-layout/`, `signal-detail-sidebar/`
- KPI display: `kpi-bar/`, `kpi-modal/`
- Interactive elements: `playback-bar/`, `sidebar/`, various modals

**State Management (`src/contexts/`):**
- `flow.js` - Flow configuration and metadata
- `stages.js` - Stage hierarchy and process steps
- `signals.js` - Entity signals and telemetry data
- `playback.js` - Time-based data playback controls
- `selections.js` - User selections and UI state
- `sidebar.js` - Sidebar navigation state

**Constants (`src/constants/`):**
- Application-wide constants for statuses, modes, stages, signals, entities, KPIs, NRQL queries, alerts, and UI content

### Data Flow Pattern

The application uses React Context providers for state management, avoiding Redux. State flows from contexts through components, with business logic separated into utility functions and constants. The app integrates with New Relic's platform APIs for telemetry data and entity management.

### Key Dependencies

- React 17.0.2 with React DOM
- New Relic Labs Components library
- Day.js for date handling
- SCSS for styling with component-level style files

## Code Style

- ESLint configuration extends recommended rules for React, import management, and Prettier
- Components use SCSS modules with individual style files
- PropTypes for component prop validation
- Functional components with hooks preferred over class components