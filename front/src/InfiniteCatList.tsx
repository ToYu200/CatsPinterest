import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

interface Cat {
  id: string;
  url: string;
}

const CAT_API_URL = 'https://api.thecatapi.com/v1/images/search';
const BACKEND_URL = '/api';
const CATS_PER_PAGE = 15;
const CAT_API_KEY = 'live_1vPgfJlq1Z1qrYwpCz3jxduIRprrg9srFO4jLDm67lSoCXNZ7G8uivBHwITUbxKB';

const InfiniteCatList = () => {
  const [cats, setCats] = useState<Cat[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  // Получить список избранных с backend
  const fetchFavorites = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError && setError('Вы не авторизованы. Пожалуйста, войдите в систему.');
      setFavoriteIds([]);
      return;
    }
    fetch(`${BACKEND_URL}/likes`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) throw new Error('Сессия истекла. Войдите заново.');
        return res.json();
      })
      .then(data => {
        setFavoriteIds(Array.isArray(data.data) ? data.data.map((like: any) => like.cat_id) : []);
      })
      .catch(err => {
        setError && setError(err.message || 'Ошибка загрузки избранного');
        setFavoriteIds([]);
      });
  }, []);

  // Загрузка котиков
  const fetchUrl = useMemo(() => {
    return `${CAT_API_URL}?limit=${CATS_PER_PAGE}&page=${page}`;
  }, [page]);

  const loadCats = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(fetchUrl, {
        headers: {
          'x-api-key': CAT_API_KEY
        }
      });
      if (!response.ok) throw new Error('Failed to fetch cats');
      const data = await response.json();
      const newCats: Cat[] = data.map((c: any) => ({ id: c.id, url: c.url }));
      setCats(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const filteredNewCats = newCats.filter((c: Cat) => !existingIds.has(c.id));
        return [...prev, ...filteredNewCats];
      });
      setPage(p => p + 1);
      if (newCats.length < CATS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cats');
      console.error('Error loading cats:', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchUrl]);

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    loadCats();
    // eslint-disable-next-line
  }, []);

  // Добавить/удалить из избранного
  const toggleFavorite = async (cat: Cat) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError && setError('Вы не авторизованы. Пожалуйста, войдите в систему.');
      return;
    }
    const isFavorite = favoriteIds.includes(cat.id);
    try {
      if (isFavorite) {
        const res = await fetch(`${BACKEND_URL}/likes/${cat.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) throw new Error('Сессия истекла. Войдите заново.');
      } else {
        const res = await fetch(`${BACKEND_URL}/likes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cat_id: cat.id }),
        });
        if (res.status === 401) throw new Error('Сессия истекла. Войдите заново.');
      }
      fetchFavorites();
    } catch (err: any) {
      setError && setError(err.message || 'Ошибка работы с избранным');
    }
  };

  // Lazy loading при скролле
  useEffect(() => {
    if (!hasMore || loading) return;
    const handleScroll = () => {
      if (loadingRef.current) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (docHeight - (scrollY + windowHeight) < 200) {
        loadCats();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, loadCats]);

  // Автозагрузка котиков до появления скролла
  useEffect(() => {
    if (!hasMore || loading) return;
    const checkScroll = () => {
      // Проверяем, есть ли скролл
      if (document.documentElement.scrollHeight <= window.innerHeight + 20 && hasMore) {
        loadCats();
      }
    };
    // Проверяем после первой загрузки и при изменении cats
    checkScroll();
    // Также слушаем resize (например, если окно стало больше)
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [cats, hasMore, loading, loadCats]);

  return (
    <>
      <div className="cat-list" style={{ minHeight: '680px' }}>
        {cats.map(cat => (
          <div key={cat.id} className="cat-card">
            <img 
              src={cat.url} 
              alt="cat" 
              loading="lazy"
            />
            <button
              className={favoriteIds.includes(cat.id) ? 'favorite active' : 'favorite'}
              onClick={() => toggleFavorite(cat)}
              aria-label={favoriteIds.includes(cat.id) ? 'Убрать из избранного' : 'В избранное'}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill={favoriteIds.includes(cat.id) ? '#e74c3c' : 'none'} stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-.9.9-.9-.9a5.5 5.5 0 0 0-7.8 7.8l.9.9L12 21.3l8.7-8.7.9-.9a5.5 5.5 0 0 0 0-7.8z"></path>
              </svg>
            </button>
          </div>
        ))}
      </div>
      {error && <div className="error">Ошибка: {error}</div>}
      {loading && hasMore && (
        <div style={{textAlign: 'center', margin: '32px 0', color: '#888', fontSize: '1.2rem'}}>
          ... загружаем еще котиков ...
        </div>
      )}
      {!hasMore && (
        <div className="empty">Больше котиков нет 😢</div>
      )}
    </>
  );
};

export default InfiniteCatList;
