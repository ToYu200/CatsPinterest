import { useState, useEffect, useRef, useCallback } from 'react';

interface Cat {
  id: string;
  url: string;
}

const CAT_API_URL = 'https://api.thecatapi.com/v1/images/search?limit=20&page=';

const InfiniteCatList = () => {
  const [cats, setCats] = useState<Cat[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef<HTMLDivElement | null>(null);

  const loadCats = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    fetch(CAT_API_URL + page)
      .then(res => res.json())
      .then((data: any[]) => {
        if (data.length === 0) setHasMore(false);
        setCats(prev => [...prev, ...data.map(c => ({ id: c.id, url: c.url }))]);
        setPage(p => p + 1);
      })
      .finally(() => setLoading(false));
  }, [page, loading, hasMore]);

  useEffect(() => {
    loadCats();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!loader.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadCats();
        }
      },
      { threshold: 1 }
    );
    observer.observe(loader.current);
    return () => observer.disconnect();
  }, [loadCats, hasMore, loading]);

  return (
    <div className="cat-list">
      {cats.map(cat => (
        <div key={cat.id} className="cat-card">
          <img src={cat.url} alt="cat" />
        </div>
      ))}
      <div ref={loader} style={{ height: 40 }} />
      {loading && <div className="loading">Загрузка...</div>}
      {!hasMore && <div className="empty">Больше котиков нет</div>}
    </div>
  );
};

export default InfiniteCatList;
