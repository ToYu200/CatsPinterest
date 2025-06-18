import { useState, useEffect, Suspense, lazy } from 'react'
import './App.css'

// Тип для котика
interface Cat {
  id: string;
  url: string;
}

const CAT_API_URL = 'https://api.thecatapi.com/v1/images/search?limit=20';
const BACKEND_URL = '/api'; // предполагается проксирование через nginx/docker
const InfiniteCatList = lazy(() => import('./InfiniteCatList'));

function App() {
  const [tab, setTab] = useState<'all' | 'favorites'>('all');
  const [favoriteCats, setFavoriteCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Автоматическая регистрация пользователя и сохранение токена
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: 'testuser', password: 'testpass' }),
      })
        .then(res => {
          const token = res.headers.get('x-auth-token');
          if (token) localStorage.setItem('token', token);
        });
    }
  }, []);

  // Загрузка всех котиков с thecatapi.com
  useEffect(() => {
    if (tab === 'all') {
      setLoading(true);
      fetch(CAT_API_URL)
        .then(res => res.json())
        .then(data => setFavoriteCats(data.map((c: any) => ({ id: c.id, url: c.url }))))
        .finally(() => setLoading(false));
    }
  }, [tab]);

  // Загрузка любимых котиков с backend
  useEffect(() => {
    if (tab === 'favorites') {
      setLoading(true);
      fetch(`${BACKEND_URL}/likes`, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } })
        .then(res => res.json())
        .then(async data => {
          const ids = data.data.map((like: any) => like.cat_id);
          // Получаем данные котиков из thecatapi по id
          const cats = await Promise.all(
            ids.map((id: string) =>
              fetch(`https://api.thecatapi.com/v1/images/${id}`).then(r => r.json())
            )
          );
          setFavoriteCats(cats);
        })
        .finally(() => setLoading(false));
    }
  }, [tab]);

  // Добавить в избранное
  const addFavorite = (cat: Cat) => {
    fetch(`${BACKEND_URL}/likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify({ cat_id: cat.id }),
    }).then(() => setFavoriteCats((cats: Cat[]) => [...cats, cat]));
  };

  // Удалить из избранного с анимацией
  const removeFavorite = (cat: Cat) => {
    setRemovingId(cat.id);
    setTimeout(() => {
      fetch(`${BACKEND_URL}/likes/${cat.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      }).then(() => {
        setFavoriteCats((cats: Cat[]) => cats.filter((c: Cat) => c.id !== cat.id));
        setRemovingId(null);
      });
    }, 300); // длительность анимации
  };

  // Рендер карточки котика
  const renderCatCard = (cat: Cat, isFavorite: boolean) => (
    <div
      key={cat.id}
      className={`cat-card${removingId === cat.id ? ' removing' : ''}`}
      style={{ transition: 'opacity 0.3s, transform 0.3s', opacity: removingId === cat.id ? 0 : 1, transform: removingId === cat.id ? 'scale(0.8)' : 'scale(1)' }}
    >
      <img src={cat.url} alt="cat" />
      <button
        className={isFavorite ? 'favorite active' : 'favorite'}
        onClick={() => (isFavorite ? removeFavorite(cat) : addFavorite(cat))}
        aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
        disabled={removingId === cat.id}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill={isFavorite ? '#e74c3c' : 'none'} stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-.9.9-.9-.9a5.5 5.5 0 0 0-7.8 7.8l.9.9L12 21.3l8.7-8.7.9-.9a5.5 5.5 0 0 0 0-7.8z"></path></svg>
      </button>
    </div>
  );

  return (
    <div className="container">
      <header>
        <h1>Кошачий пинтерест</h1>
        <nav>
          <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>Все котики</button>
          <button className={tab === 'favorites' ? 'active' : ''} onClick={() => setTab('favorites')}>Любимые котики</button>
        </nav>
      </header>
      <main>
        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : tab === 'all' ? (
          <Suspense fallback={<div className="loading">Загрузка котиков...</div>}>
            <InfiniteCatList />
          </Suspense>
        ) : (
          <div className="cat-list">
            {favoriteCats.length === 0 ? (
              <div className="empty">Нет любимых котиков</div>
            ) : (
              favoriteCats.map((cat: Cat) => renderCatCard(cat, true))
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
