import { Component, OnInit, inject } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductComponent } from 'src/app/shared/components/add-update-product/add-update-product.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  products: Product[] = [];
  loading: boolean = false;

  ngOnInit() {}

  // User related methods
  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  // Product related methods
  ionViewWillEnter() {
    this.getProducts();
  }

  doRefresh(event) {
    setTimeout(() => {
      this.getProducts();
      event.target.complete();
    }, 1000);
  }

  getProducts() {
    let path = `users/${this.user().uid}/products`;

    this.loading = true;

    let sub = this.firebaseSvc.getCollectionData(path).subscribe({
      next: (res: any) => {
        console.log(res);
        this.products = res;

        this.loading = false;

        sub.unsubscribe();
      },
    });
  }

  async addUpdateProduct(product?: Product) {
    let success = await this.utilsSvc.presentModal({
      component: AddUpdateProductComponent,
      cssClass: 'add-update-modal',
      componentProps: { product },
    });

    if (success) this.getProducts();
  }

  async confirmDeleteProduct(product: Product) {
    this.utilsSvc.presentAlert({
      header: 'Eliminar producto!',
      message: 'Quieres eliminar este producto?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Si, Eliminar',
          handler: () => {
            this.deleteProduct(product);
          },
        },
      ],
    });
  }

  async deleteProduct(product: Product) {
    let path = `users/${this.user().uid}/products/${product.id}`;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    let imagePath = await this.firebaseSvc.getFilePath(product.image);
    await this.firebaseSvc.deleteFile(imagePath);

    this.firebaseSvc.deleteDocument(path)
      .then(async (res) => {
        this.products = this.products.filter((p) => p.id !== product.id);

        this.utilsSvc.presentToast({
          message: 'Producto Eliminado Exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      })
      .catch((error) => {
        console.log(error);

        this.utilsSvc.presentToast({
          message: error.message,
          duration: 3000,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      })
      .finally(() => {
        loading.dismiss();
      });
  }

  // Cart related methods
  async addToCart(product: Product, itemSliding: IonItemSliding) {
    await this.utilsSvc.presentAlert({
      header: 'Agregar al carrito',
      message: '¿Estás seguro de que quieres agregar este producto al carrito?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Agregar',
          handler: async () => {
            const loading = await this.utilsSvc.loading();
            await loading.present();
  
            let cart: { [id: string]: { product: Product, quantity: number } } = this.getCart();
            console.log('Cart before adding product:', cart); // Add this line
            if (cart[product.id]) {
              cart[product.id].quantity += 1;
            } else {
              cart[product.id] = { product: product, quantity: 1 };
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            console.log('Cart after adding product:', cart); // Add this line
            this.printCart();
  
            await this.utilsSvc.presentToast({
              message: 'Producto Agregado Exitosamente al Carrito',
              duration: 1500,
              color: 'success',
              position: 'middle',
              icon: 'checkmark-circle-outline',
            });
  
            loading.dismiss();
            itemSliding.close();
          }
        }
      ]
    });
  }

  getCart(): { [id: string]: { product: Product, quantity: number } } {
    let cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : {};
  }

  printCart() {
    console.log(this.getCart());
  }


  removeFromCart(product: Product, quantity: number) {
    let cart: { [id: string]: { product: Product, quantity: number } } = this.getCart();
    if (cart[product.id]) {
      cart[product.id].quantity -= quantity;
      if (cart[product.id].quantity <= 0) {
        delete cart[product.id];
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      this.getCart();
    }
  }
}