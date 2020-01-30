import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable()
export class SettingsService {
    constructor(private apollo: Apollo) { }

    updateUser(payload): any {
        const { email, name, oldPassword, password } = payload;

        return this.apollo
            .mutate({
                mutation: gql`
                     mutation UpdateUser {
                         updateUser( userUpdateInput: {
                                email: "${email}"
                               ${name ? `,name: "${name}"` : ''}
                               ${password && oldPassword ? `,password: "${password}"` : ''}
                               ${password && oldPassword ? `,oldPassword: "${oldPassword}"` : ''}
                               }
                            ) {
                                user{
                                    uuid,
                                    email,
                                    paymentInfo {
                                        cardNumber,
                                        userEmail,
                                        isActive,
                                        status,
                                    },
                                    createdByGoogle,
                                    profile {
                                        photoUrl,
                                        name,
                                    },
                                },
                                token,
                                ok,
                                error
                            }
                        }`
            })
            .pipe(map(result => result.data.updateUser));
    }
}
