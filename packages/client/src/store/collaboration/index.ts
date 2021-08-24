import { defineStore } from 'pinia'
import { Collaborator, randomUsername } from '@playground/shared'
import { useAuth } from '../auth'

export interface UseCollaborationState {
  id: string | null
  username: string
  session: string | null
  isConnected: boolean
  isDialogOpen: boolean
  collaborators: Collaborator[]
}

export const useCollaboration = defineStore('collaboration', {
  state: () => ({
    id: null,
    username: randomUsername(),
    session: null,
    isConnected: false,
    isDialogOpen: false,
    collaborators: [],
  }) as UseCollaborationState,
  getters: {
    otherCollaborators(state: UseCollaborationState) {
      return state.collaborators.filter(({ id }) => id !== state.id)
    },

    getUsername(state: UseCollaborationState) {
      const auth = useAuth()

      if (auth.isAuthenticated)
        return auth.user?.displayName || state.username

      return state.username
    },
  },
  actions: {
    openDialog() { this.isDialogOpen = true },
    closeDialog() { this.isDialogOpen = false },
  },
})
