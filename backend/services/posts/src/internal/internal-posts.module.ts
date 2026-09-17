import { Module } from '@nestjs/common'
import { InternalPostsController } from './internal-posts.controller'
import { PostsModule } from '../posts/posts.module'

@Module({
	imports: [PostsModule],
	controllers: [InternalPostsController],
})
export class InternalPostsModule {}
