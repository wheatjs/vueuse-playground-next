import { defineStore } from 'pinia'
import { Collaborator, randomUsername } from '@playground/shared'

export { CollaborationManager } from './manager'

export interface UseCollaborationState {
  id: string | null
  username: string
  session: string | null
  isConnected: boolean
  isDialogOpen: boolean
  collaborators: Collaborator[]
}

export const useCollaboration = defineStore({
  id: 'collaboration',
  state: () => ({
    id: null,
    username: randomUsername(),
    session: null,
    isConnected: false,
    isDialogOpen: false,
    collaborators: [],
  }) as UseCollaborationState,
  getters: {
    shareLink(state: UseCollaborationState) {
      const url = new URL(window.location.href)

      if (url.searchParams.has('room'))
        url.searchParams.delete('room')

      url.searchParams.append('room', state.session || '')
      return url.toString()
    },

    otherCollaborators(state: UseCollaborationState) {
      return state.collaborators.filter(({ id }) => id !== state.id)
    },
  },
  actions: {
    openDialog() { this.isDialogOpen = true },
    closeDialog() { this.isDialogOpen = false },
  },
})
