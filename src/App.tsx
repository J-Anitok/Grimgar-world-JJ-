import { useEffect } from 'react';
import { useAppStore } from '@/store';
import { CharacterList } from '@/components/CharacterList';
import { CharacterDetail } from '@/components/CharacterDetail';
import { GrimgarEngine } from '@/components/GrimgarEngine';
import { Users, Settings, Wand2 } from 'lucide-react';

function App() {
  const { activeTab, setActiveTab, addCharacter } = useAppStore();

  // Add some sample data on first load
  useEffect(() => {
    const hasData = localStorage.getItem('app-initialized');
    if (!hasData) {
      addCharacter('Aragorn', 'player');
      addCharacter('Legolas', 'player');
      addCharacter('Gimli', 'player');
      addCharacter('Goblin Chief', 'npc');
      addCharacter('Dragon', 'npc');
      localStorage.setItem('app-initialized', 'true');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded"></div>
              <h1 className="text-2xl font-bold">Character Stat Hub</h1>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveTab('players')}
                className={`px-4 py-2 rounded flex items-center gap-2 transition text-sm ${
                  activeTab === 'players'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Users size={18} /> Players
              </button>
              <button
                onClick={() => setActiveTab('npcs')}
                className={`px-4 py-2 rounded flex items-center gap-2 transition text-sm ${
                  activeTab === 'npcs'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Users size={18} /> NPCs
              </button>
              <button
                onClick={() => setActiveTab('grimgar')}
                className={`px-4 py-2 rounded flex items-center gap-2 transition text-sm ${
                  activeTab === 'grimgar'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Wand2 size={18} /> Grimgar
              </button>
              <button
                onClick={() => setActiveTab('manager')}
                className={`px-4 py-2 rounded flex items-center gap-2 transition text-sm ${
                  activeTab === 'manager'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Settings size={18} /> Manager
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'players' && (
          <div className="space-y-8">
            <CharacterList type="player" />
            <div className="border-t border-slate-700 pt-8">
              <CharacterDetail />
            </div>
          </div>
        )}

        {activeTab === 'npcs' && (
          <div className="space-y-8">
            <CharacterList type="npc" />
            <div className="border-t border-slate-700 pt-8">
              <CharacterDetail />
            </div>
          </div>
        )}

        {activeTab === 'grimgar' && (
          <GrimgarEngine />
        )}

        {activeTab === 'manager' && (
          <div className="text-center py-12">
            <Settings size={48} className="mx-auto mb-4 text-slate-400" />
            <p className="text-slate-400">Manager features coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
