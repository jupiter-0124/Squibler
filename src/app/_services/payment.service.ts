import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';

@Injectable()
export class PaymentService {
  constructor(private apollo: Apollo) { }

  updateCard(cardData: any) {
    const { card_number, cart_type, cvv, exp_month, exp_year } = cardData;

    return this.apollo
      .mutate({
        mutation: gql`
            mutation addPayment{
              addPayment(cardCvv: ${Number(cvv)}, cardExpMonth: ${Number(exp_month)}, cardExpYear: ${Number(exp_year)}, cardNumber: "${card_number}") {
                ok,
                created,
                error,
                message
              }
            }
          `
      })
      .pipe(map(result => result.data.addPayment));
  }

  removeCard() {
    return this.apollo
      .mutate({
        mutation: gql`
            mutation cancelPayment{
              cancelPayment {
                ok,
                error
              }
            }
          `
      })
      .pipe(map(result => result.data.cancelPayment));
  }
}
