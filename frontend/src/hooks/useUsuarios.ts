import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useUsuarios = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data } = await api.get('/usuarios');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (nuevoUsuario: any) => {
      const { data } = await api.post('/usuarios', nuevoUsuario);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...usuarioActualizado }: any) => {
      const { data } = await api.put(`/usuarios/${id}`, usuarioActualizado);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  const toggleEstadoMutation = useMutation({
    mutationFn: async ({ id, sudoPassword }: { id: string; sudoPassword?: string }) => {
      const config = sudoPassword ? { headers: { 'x-sudo-password': sudoPassword } } : undefined;
      const { data } = await api.patch(`/usuarios/${id}/estado`, {}, config);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  return {
    usuarios: query.data || [],
    isLoading: query.isPending,
    error: query.error,
    createUsuario: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateUsuario: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    toggleEstadoUsuario: toggleEstadoMutation.mutateAsync,
    isTogglingEstado: toggleEstadoMutation.isPending,
  };
};
