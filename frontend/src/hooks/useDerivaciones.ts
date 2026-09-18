import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useDerivaciones = (pacienteId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['derivaciones', pacienteId],
    queryFn: async () => {
      const { data } = await api.get(`/derivaciones/paciente/${pacienteId}`);
      return data;
    },
    enabled: !!pacienteId,
  });

  const createMutation = useMutation({
    mutationFn: async (nuevaDerivacion: FormData) => {
      const { data } = await api.post('/derivaciones', nuevaDerivacion, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['derivaciones'] });
    },
  });

  return {
    derivaciones: query.data || [],
    isLoading: query.isPending,
    createDerivacion: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
};
