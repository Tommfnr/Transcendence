import { Component, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-editAddPost',
  imports: [RouterLink],
  templateUrl: './editAddPost.html',
})
export class EditAddPost {
  private route = inject(ActivatedRoute);

  private postId = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = !!this.postId;
}
