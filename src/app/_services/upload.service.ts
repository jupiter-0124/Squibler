import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
@Injectable()
export class UploadService {
  constructor(private apollo: Apollo) { }

  public upload(base64: String) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateUser($file: Upload!) {
              updateUser( userUpdateInput: {file: $file} ) {
                user{
                  uuid,
                  email,
                  profile {
                    photoUrl,
                    name,
                    photo,
                  },
                },
                ok,
                error
              }
            }`,
        variables: {
          file: base64
        }
      })
      .pipe(map(result => result.data.updateUser));
  }
}
