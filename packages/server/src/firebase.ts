import admin from 'firebase-admin'
import { ServiceKey } from './serviceKey'

/**
 * Manages Firestore interactions
 */
export class FirebaseManager {
  private db: FirebaseFirestore.Firestore

  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert((ServiceKey as any)),
    })
    this.db = admin.firestore()
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
