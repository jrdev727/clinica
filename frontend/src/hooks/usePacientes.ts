import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const usePacientes = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['pacientes'],
    queryFn: async () => {
      const { data } = await api.get('/pacientes');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newPaciente: any) => {
      const { data } = await api.post('/pacientes', newPaciente);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updatedPaciente }: any) => {
      const { data } = await api.put(`/pacientes/${id}`, updatedPaciente);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, sudoPassword }: { id: string, sudoPassword?: string }) => {
      const config = sudoPassword ? { headers: { 'x-sudo-password': sudoPassword } } : undefined;
      const { data } = await api.delete(`/pacientes/${id}`, config);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
    },
  });

  return {
    pacientes: query.data || [],
    isLoading: query.isPending,
    error: query.error,
    createPaciente: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updatePaciente: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deletePaciente: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
