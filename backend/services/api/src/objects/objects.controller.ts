// Controller files handle the HTTP request mapping
// You'll find here GET/POST/DELETE requests calling functions through the ORM instance

import { Controller, Get, Post, Delete } from '@nestjs/common'

@Controller()
export class ObjectsController {

	@Get()

}