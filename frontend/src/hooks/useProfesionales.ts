import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useProfesionales = () => {
  const query = useQuery({
    queryKey: ['profesionales'],
    queryFn: async () => {
      const { data } = await api.get('/profesionales');
      return data;
    },
  });

  return {
    profesionales: query.data || [],
    isLoading: query.isPending,
    error: query.error,
  };
};
