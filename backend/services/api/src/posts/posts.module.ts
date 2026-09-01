import { Module } from '@nestjs/common'
import { PostsController } from './posts.controller'
import { PostsService } from './posts.service'
import { GroupsModule } from '../groups/groups.module'

@Module({
	imports: [GroupsModule],
	controllers: [PostsController],
	providers: [PostsService],
})
export class PostsModule {}
