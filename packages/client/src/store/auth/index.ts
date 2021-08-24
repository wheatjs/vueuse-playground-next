import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'
import { getAuth, GithubAuthProvider, signInWithPopup } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { useLocalStorage } from '@vueuse/core'
import { randomUsername } from '@playground/shared'
import { auth } from './firebase'

export interface UseAuthState {
  client: string
  user: User | null
  isAuthenticated: boolean
  isDialogOpen: boolean
}

const username = useLocalStorage('playground-username', randomUsername())
const clientId = useLocalStorage('playground-client-id', nanoid())

export const useAuth = defineStore({
  id: 'auth',
  state() {
    return {
      client: clientId.value,
      user: null,
      isAuthenticated: false,
      isDialogOpen: false,
    } as UseAuthState
  },
  getters: {

    username(state: UseAuthState) {
      if (state.user?.displayName)
        return state.user.displayName

      return username.value
    },

    avatar(state: UseAuthState) {
      if (state.user?.photoURL)
        return state.user.photoURL

      return `https://avatars.dicebear.com/api/bottts/${state.client}.svg`
    },

  },
  actions: {

    /**
     * Probably not the best place for this, might move it later.
     */
    init() {
      getAuth()
        .onAuthStateChanged((user) => {
          this.isAuthenticated = !!user
          this.user = user
        })
    },

    openDialog() { this.isDialogOpen = true },
    closeDialog() { this.isDialogOpen = false },

    authenticateWithGithub() {
      signInWithPopup(auth, new GithubAuthProvider())
        .then(() => {
          this.closeDialog()
        })
        .catch((error) => {
          console.error('Sign in Failed', error)
        })
    },

    signOut() {
      auth.signOut()
    },
  },
})
