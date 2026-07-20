# Character Stat Hub

A comprehensive character stat management system built for tabletop RPGs like D&D, featuring integration with the **Grimgar Campaign Engine**. Manage player characters and NPCs with a full training system, stat tracking, and immersive world-building tools.

## Features

### 📊 **Character Management**
- Create and manage both player characters and NPCs
- Track core stats (Strength, Constitution, Dexterity, Intelligence, Wisdom, Charisma)
- Track sub-stats (Guard, Stamina, Endurance, Agility, Leadership, Pain Tolerance, Mana Focus, Mana Pool)
- Custom sub-stats support

### 🎲 **Training System**
- Configurable dice rolling (D4, D6, D8)
- Training modifiers
- Automatic threshold calculation based on stat levels
- Pass/fail tracking with carry bank accumulation

### 🏰 **Grimgar Campaign Engine**
- **Amnesiac Generator**: Generate new characters waking up at the Forbidden Tower
- **NPC Registry**: Lookup major NPCs (Britney, Barbara, Master Hanz) with full stats and inventory
- **Loot Scavenge**: Simulate monster encounters (Goblins, Kobolds) with procedural loot drops
- **Grief Calculator**: Calculate party morale penalties based on fallen members
- **Economy System**: Currency conversions (GC/SC/CC) and pricing for frontier items

### 📋 **Visual Dashboard**
- Real-time stat display
- Color-coded stat categories
- Training history with full roll details
- Responsive grid layout

### 📚 **History & Tracking**
- Complete training history with timestamps
- Entry type classification (training, manual edit, ripple bonus, routine summary)
- Detailed dice roll information
- Carry bank tracking

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/J-Anitok/Grimgar-world-JJ-.git
cd Grimgar-world-JJ-

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development

```bash
# Run dev server (opens at http://localhost:5173)
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
  ├── types/              TypeScript interfaces and types
  ├── store/              Zustand state management
  ├── data/               Game data (Grimgar NPCs, loot tables)
  ├── components/         React components
  │   ├── CharacterList.tsx        Character list and creation
  │   ├── CharacterDetail.tsx      Detailed character view
  │   ├── StatDisplay.tsx          Stat visualization
  │   ├── TrainingPanel.tsx        Training system UI
  │   ├── TrainingHistory.tsx      History log
  │   └── GrimgarEngine.tsx        Grimgar campaign engine
  ├── App.tsx             Main application
  ├── main.tsx            React entry point
  └── index.css           Tailwind styles
```

## Usage

### Creating a Character
1. Click "Add Player" or "Add NPC" button
2. Enter character name in the prompt
3. Character is created with default starting stats

### Training a Character
1. Select a character from the list
2. In the Training Roll panel, configure:
   - **Stat**: Which stat to train
   - **Number of Dice**: How many dice to roll
   - **Die Type**: D4, D6, or D8
   - **Training Modifier**: Additional modifier to the roll
3. Click "Roll Training"
4. View results - success increases stat by 1, failure accumulates to carry bank

### Using the Grimgar Campaign Engine

#### Amnesiac Generator
- Click "Generate Amnesiac" to create a new character waking in the Grimgar world
- Get a random name and personality trait
- View starting resources and survival requirements

#### NPC Registry
- Browse available NPCs from Alterna
- View their stats, combat abilities, and available equipment
- Learn about each NPC's role in the world

#### Loot Scavenge
- Select a monster type (Goblin or Kobold)
- Simulate searching their remains
- Procedurally generate loot with currency values
- Encounter the "Scarcity Penalty" for unlucky searches

#### Grief Calculator
- Input number of fallen party members
- Calculate mourning duration
- View mechanical penalties applied to survivors

#### Economy System
- View currency exchange rates (GC ↔ SC ↔ CC)
- Check typical costs for items and services
- Plan character budgets

## Data Structure

### Character
```typescript
interface Character {
  id: string;
  name: string;
  type: "player" | "npc";
  image: string;
  coreStats: { [statName]: StatValue };
  subStats: { [statName]: SubStatValue };
  customSubStats: CustomSubStat[];
  subStatGainCounts: Record<string, number>;
  statHistory: StatHistoryEntry[];
}
```

### StatValue
```typescript
interface StatValue {
  value: number;        // Current stat value
  carryBank: number;    // Accumulated failed rolls
}
```

## Future Features

- [ ] Undo/Redo system
- [ ] Ripple effect cascading (stats affecting other stats)
- [ ] Routine NPC training
- [ ] Custom stat definitions
- [ ] Export/Import characters
- [ ] Character templates
- [ ] Multiplayer session support
- [ ] Mobile app version
- [ ] Advanced Grimgar world mechanics
- [ ] Party-level campaign tracking

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## License

MIT License - feel free to use this project for any purpose.

## Support

For issues or questions, please create an issue in the repository.
