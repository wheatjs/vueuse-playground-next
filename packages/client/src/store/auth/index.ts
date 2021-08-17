import { defineStore } from 'pinia'
import { getAuth, GithubAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from './firebase'

export interface UseAuthState {
  user: User | null
  isAuthenticated: boolean
  isDialogOpen: boolean
}

export const useAuth = defineStore({
  id: 'auth',
  state() {
    return {
      user: null,
      isAnonymous: false,
      isAuthenticated: false,
      isDialogOpen: false,
    } as UseAuthState
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
    authenticateAnonymously() {
      signInAnonymously(auth)
        .catch((error) => {
          console.error('Sign in Failed', error)
        })
    },

    signOut() {
      auth.signOut()
    },
  },
})
