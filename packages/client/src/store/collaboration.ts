import { defineStore } from 'pinia'
import { customAlphabet } from 'nanoid'
import { editor as Editor } from 'monaco-editor'

interface Collaborator {
  id: string
  name: string
}

interface CollaborationEditor {
  type: string
  editor: Editor.IStandaloneCodeEditor
}

interface UseCollaborationState {
  id: string
  isHost: boolean
  isOpen: boolean
  isConnected: boolean
  isDialogOpen: boolean
  editors: CollaborationEditor[]
  collaborators: Collaborator[]
}

export const useCollaboration = defineStore({
  id: 'collaboration',
  state: () => ({
    id: customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789', 8)(),
    isHost: false,
    isOpen: false,
    isConnected: false,
    isDialogOpen: false,
    editors: [],
    collaborators: [],
  }) as UseCollaborationState,
  getters: {
    shareLink(state: UseCollaborationState) {
      const url = new URL(window.location.href)
      url.searchParams.append('c', state.id)
      return url.toString()
    },

    others(state: UseCollaborationState) {
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

    addCollaborator(collaborator: Collaborator) {
      this.collaborators = [
        ...this.collaborators,
        collaborator,
      ]
    },

    removeCollaborator(id: string) {
      this.collaborators = this.collaborators.filter(c => c.id !== id)
    },
  },
})
