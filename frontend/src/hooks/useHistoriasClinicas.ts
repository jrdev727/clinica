import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useHistoriasClinicas = (pacienteId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['historiasClinicas', pacienteId],
    queryFn: async () => {
      const { data } = await api.get(`/historias-clinicas/paciente/${pacienteId}`);
      return data;
    },
    enabled: !!pacienteId,
  });

  const createMutation = useMutation({
    mutationFn: async (nuevaEvolucion: FormData | any) => {
      // Si es FormData, axios se encarga del multipart automáticamente
      const { data } = await api.post('/historias-clinicas', nuevaEvolucion, {
        headers: nuevaEvolucion instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historiasClinicas'] });
    },
  });

  const firmarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/historias-clinicas/${id}/firmar`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historiasClinicas'] });
    },
  });

  return {
    evoluciones: query.data || [],
    isLoading: query.isPending,
    error: query.error,
    createEvolucion: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    firmarEvolucion: firmarMutation.mutateAsync,
    isFirmando: firmarMutation.isPending,
  };
};
