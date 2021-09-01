import admin from 'firebase-admin'
import { getServiceKey } from './serviceKey'

/**
 * Manages Firestore interactions
 */
export class FirebaseManager {
  private db: FirebaseFirestore.Firestore
  private auth: admin.auth.Auth

  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(getServiceKey()),
    })
    this.auth = admin.auth()
    this.db = admin.firestore()
  }

  public async authorize(token: string) {
    try {
      return await this.auth.verifyIdToken(token)
    }
    catch (error) {
      return false
    }
  }

  /**
     * Stores data under the specified unique object ID
     * @param id Unique ID of the object
     * @param data data for this object
     */
  public async StoreData(id: string, data: any) {
    await this.db
      .collection('playgrounds')
      .doc(id)
      .set(data)
  }

  /**
     * Returns an object by its ID
     * @param id Unique ID of this object
     */
  public async GetData(id: string): Promise<any> {
    const res = await this.db
      .collection('playgrounds')
      .doc(id)
      .get()

    return res?.data()
  }
}
