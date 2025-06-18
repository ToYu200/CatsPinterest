import { useState, useEffect, Suspense, lazy } from 'react'
import './App.css'

// Тип для котика
interface Cat {
  id: string;
  url: string;
}

const BACKEND_URL = '/api'; // предполагается проксирование через nginx/docker
const InfiniteCatList = lazy(() => import('./InfiniteCatList'));

function App() {
  const [tab, setTab] = useState<'all' | 'favorites'>('all');
  const [favoriteCats, setFavoriteCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // функция для загрузки избранных котиков с сервера
  const fetchFavoriteCats = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Вы не авторизованы. Пожалуйста, войдите в систему.');
      setLoading(false);
      setFavoriteCats([]);
      return;
    }
    fetch(`${BACKEND_URL}/likes`, { headers: { Authorization: 'Bearer ' + token } })
      .then(res => {
        if (res.status === 401) throw new Error('Сессия истекла. Войдите заново.');
        return res.json();
      })
      .then(async data => {
        const ids = data.data.map((like: any) => like.cat_id);
        const cats = await Promise.all(
          ids.map((id: string) =>
            fetch(`https://api.thecatapi.com/v1/images/${id}`)
              .then(r => r.ok ? r.json() : null)
              .catch(() => null)
          )
        );
        setFavoriteCats(cats.filter((c: any) => c && c.id && c.url));
      })
      .catch(err => {
        setError(err.message || 'Ошибка загрузки избранного');
        setFavoriteCats([]);
      })
      .finally(() => setLoading(false));
  };

  // любимые котики бек
  useEffect(() => {
    if (tab === 'favorites') {
      fetchFavoriteCats();
    }
  }, [tab]);

  // избранное
  const addFavorite = async (cat: Cat) => {
    try {
      await fetch(`${BACKEND_URL}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cat_id: cat.id }),
      });
      fetchFavoriteCats();
    } catch (err: any) {
      setError(err.message || 'Ошибка добавления в избранное');
    }
  };

  // удаление из избраноого
  const removeFavorite = async (cat: Cat) => {
    setRemovingId(cat.id);
    setTimeout(async () => {
      try {
        await fetch(`${BACKEND_URL}/likes/${cat.id}`, {
          method: 'DELETE',
        });
        fetchFavoriteCats();
      } catch (err: any) {
        setError(err.message || 'Ошибка удаления из избранного');
      } finally {
        setRemovingId(null);
      }
    }, 500);
  };

  // реднер карточки
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
    <>
      <header className="main-header">
        <nav className="tabs">
          <button
            className={tab === 'all' ? 'tab active' : 'tab'}
            onClick={() => setTab('all')}
          >
            Все котики
          </button>
          <button
            className={tab === 'favorites' ? 'tab active' : 'tab'}
            onClick={() => setTab('favorites')}
          >
            Любимые котики
          </button>
        </nav>
      </header>
      <div className="container">
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
          {error && <div className="error">{error}</div>}
        </main>
      </div>
    </>
  )
}

export default App
