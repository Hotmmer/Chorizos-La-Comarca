import { Component, OnInit, inject } from '@angular/core';
import { Product } from '../../../models/product.model';
import { UtilsService } from 'src/app/services/utils.service';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {

  utilsSvc = inject(UtilsService);


  cartProducts: { product: Product, quantity: number }[] = [];
  loading = false;



  constructor() { }

  ngOnInit() {
    this.getCart();
  }

  getCart(): void {
    this.loading = true;
    let cart = localStorage.getItem('cart');
    console.log('Cart data from localStorage:', cart); // Add this line
    if (cart) {
      let cartObject = JSON.parse(cart);
      this.cartProducts = Object.values(cartObject);
    } else {
      this.cartProducts = [];
    }
    this.loading = false;
  }

  async confirmClearCart() {
    this.utilsSvc.presentAlert({
      header: 'Vaciar carrito',
      message: '¿Estás seguro de que quieres vaciar el carrito?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
        },
        {
          text: 'Sí, vaciar',
          handler: () => {
            this.clearCart();
          },
        },
      ],
    });
  }

  clearCart() {
    localStorage.removeItem('cart');
    this.cartProducts = [];
  }


  removeFromCart(product: Product, quantity: number) {
    let cart = localStorage.getItem('cart');
    if (cart) {
      let cartObject = JSON.parse(cart);
      delete cartObject[product.id];
      localStorage.setItem('cart', JSON.stringify(cartObject));
      this.getCart();
    }
  }
}
