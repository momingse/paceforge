import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">PaceForge</h1>
        <p className="text-lg text-muted-foreground mb-8">
          AI-Assisted Running Training Plan Editor
        </p>
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="mb-4">
            Welcome to PaceForge! Your browser-based AI-assisted running training plan editor.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              Count is {count}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
