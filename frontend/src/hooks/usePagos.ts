import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const usePagos = (filtros?: { fechaInicio?: string, fechaFin?: string }) => {
  const queryClient = useQueryClient();

  const { data: pagos, isLoading, error } = useQuery({
    queryKey: ['pagos', filtros],
    queryFn: async () => {
      const { data } = await api.get('/pagos', { params: filtros });
      return data;
    },
  });

  const { mutateAsync: createPago, isPending: isCreating } = useMutation({
    mutationFn: async (nuevoPago: any) => {
      const { data } = await api.post('/pagos', nuevoPago);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
    },
  });

  return {
    pagos,
    isLoading,
    error,
    createPago,
    isCreating
  };
};