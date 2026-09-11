import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useAuditoria = () => {
  const query = useQuery({
    queryKey: ['auditoria'],
    queryFn: async () => {
      const { data } = await api.get('/auditoria');
      return data;
    },
  });

  return {
    logs: query.data || [],
    isLoading: query.isPending,
    error: query.error,
  };
};
