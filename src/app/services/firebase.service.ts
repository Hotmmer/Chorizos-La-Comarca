import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from '@firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc, addDoc, collection, collectionData, query, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { getStorage, uploadString, ref, getDownloadURL, deleteObject} from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilSvc = inject(UtilsService);

  // authenticacion //

  getAuth(){
    return getAuth();
  }


  // Acceder //

  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  // Registrarse //

  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  // Actualizar perfil //

  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName });
  }

   // Enviar Email para reestablecer la contrase;a //

   sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }

     // Cerrar Sesión//

     signOut() {
      getAuth().signOut();
      localStorage.removeItem('user');
      this.utilSvc.routerLink('/auth');
    }

   // Base de datos //  // Base de datos //  // Base de datos //

     // Obtener un documento //

   getCollectionData(path: string, collectionQuery?: any) {
    const ref = collection(getFirestore(), path);
    return collectionData(query(ref, collectionQuery), {idField:'id'})
  }

  // Setear un documento //

  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  
  // Actualizar un documento //

  updateDocument(path: string, data: any) {
    return updateDoc(doc(getFirestore(), path), data);
  }

   // Eliminar un documento //

   deleteDocument(path: string) {
    return deleteDoc(doc(getFirestore(), path));
  }

 // Get un documento //

  async getDocument(path: string) {
   return (await getDoc(doc(getFirestore(), path))).data();
}

 // Agregar documento //

 addDocument(path: string, data: any) {
  return addDoc(collection(getFirestore(), path), data);
}

 // Almacenamiento //  // Almacenamiento //  // Almacenamiento //

  // Subir imagen //
 
async uploadImage(path: string, data_url: string) {
 return uploadString(ref(getStorage(),path), data_url, 'data_url').then(() => {
  return getDownloadURL(ref(getStorage(),path))
 })
}

 // Obtener ruta imagen //

  async getFilePath(url: string){
    return ref(getStorage(),url).fullPath
  }

   // Eliminar archivos //

   deleteFile(path: string){
    return deleteObject(ref(getStorage(),path));
   }

}
