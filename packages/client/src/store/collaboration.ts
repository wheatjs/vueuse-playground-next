import { defineStore } from 'pinia'
import { Collaborator, randomUsername } from '@playground/shared'

interface UseCollaborationState {
  id: string | null
  username: string
  session: string | null
  isConnected: boolean
  isDialogOpen: boolean
  collaborators: Collaborator[]
  suppressContentEvent: boolean
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
    suppressContentEvent: false,
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
    openDialog() {
      this.isDialogOpen = true
    },

    closeDialog() {
      this.isDialogOpen = false
    },
  },
})
