import { useState, useEffect } from 'react';
import { getDynamicPagesForAdminDashboard, type DynamicPage } from '../services/dynamicPagesService';

export const useDynamicPagesData = () => {
  const [dynamicPages, setDynamicPages] = useState<DynamicPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDynamicPages = async () => {
      try {
        setLoading(true);
        setError(null);
        const pages = await getDynamicPagesForAdminDashboard();
        setDynamicPages(pages);
      } catch (err) {
        console.error('Error fetching dynamic pages:', err);
        setError('Failed to load dynamic pages');
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicPages();
  }, []);

  return { dynamicPages, loading, error };
};
