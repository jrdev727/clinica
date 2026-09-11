import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useTurnos = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['turnos'],
    queryFn: async () => {
      // Idealmente podríamos pasar params ?fechaInicio=&fechaFin=
      const { data } = await api.get('/turnos');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newTurno: any) => {
      const { data } = await api.post('/turnos', newTurno);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updatedTurno }: any) => {
      const { data } = await api.put(`/turnos/${id}`, updatedTurno);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
    },
  });

  const updateEstadoMutation = useMutation({
    mutationFn: async ({ id, estado, sudoPassword }: { id: string, estado: string, sudoPassword?: string }) => {
      const config = sudoPassword ? { headers: { 'x-sudo-password': sudoPassword } } : undefined;
      const { data } = await api.patch(`/turnos/${id}/estado`, { estado }, config);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, sudoPassword }: { id: string, sudoPassword?: string }) => {
      const config = sudoPassword ? { headers: { 'x-sudo-password': sudoPassword } } : undefined;
      const { data } = await api.delete(`/turnos/${id}`, config);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
    },
  });

  return {
    turnos: query.data || [],
    isLoading: query.isPending,
    error: query.error,
    createTurno: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateTurno: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateEstadoTurno: updateEstadoMutation.mutateAsync,
    deleteTurno: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
