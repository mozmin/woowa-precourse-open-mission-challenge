import { useMemo, useState } from 'react';
import Calculator from './features/calculator/Calculator';
import Lotto from './features/lotto/Lotto';
import Racing from './features/racing/Racing';
import './App.css';

const TABS = [
  { id: 'calculator', label: '계산기' },
  { id: 'lotto', label: '로또' },
  { id: 'racing', label: '자동차 경주' },
];

const PlaceholderPanel = ({ label }) => (
  <div className="placeholder">
    <p>{label} 화면은 곧 준비될 예정이에요.</p>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const content = useMemo(() => {
    if (activeTab === 'calculator') {
      return <Calculator />;
    }
    if (activeTab === 'lotto') {
      return <Lotto />;
    }
    if (activeTab === 'racing') {
      return <Racing />;
    }

    const selected = TABS.find((tab) => tab.id === activeTab);
    return <PlaceholderPanel label={selected?.label ?? '이 기능'} />;
  }, [activeTab]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="app-shell">
      <button
        type="button"
        className="hamburger"
        aria-label="탭 메뉴 토글"
        onClick={toggleSidebar}
      >
        <span />
        <span />
        <span />
      </button>

      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <nav className="sidebar__menu" aria-label="주제 선택">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`sidebar__item ${
                tab.id === activeTab ? 'is-active' : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="workspace">{content}</main>
    </div>
  );
}

export default App;
